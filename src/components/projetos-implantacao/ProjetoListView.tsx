import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUp, ArrowDown, ChevronsUpDown, Pencil, Trash2, Loader2 } from 'lucide-react'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ProjetoImplantacao } from '@/services/projetos-implantacao'

type SortColumn = 'name' | 'analyst' | 'status' | 'prazos'

type SortDirection = 'asc' | 'desc'

const columns: { key: SortColumn; label: string }[] = [
  { key: 'name', label: 'Projeto' },
  { key: 'analyst', label: 'Analista' },
  { key: 'status', label: 'Status' },
  { key: 'prazos', label: 'Prazos' },
]

function formatDate(date: string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function getSortValue(projeto: ProjetoImplantacao, column: SortColumn): string {
  switch (column) {
    case 'name':
      return projeto.name?.toLowerCase() ?? ''
    case 'analyst':
      return projeto.analyst?.nome?.toLowerCase() ?? ''
    case 'status':
      return projeto.status?.toLowerCase() ?? ''
    case 'prazos': {
      const parts = [projeto.forecast_start ?? '', projeto.forecast_end ?? ''].filter(Boolean)
      return parts.join(' ') ?? ''
    }
  }
}

function buildPrazosText(projeto: ProjetoImplantacao): string {
  const fs = formatDate(projeto.forecast_start)
  const fe = formatDate(projeto.forecast_end)
  if (!fs && !fe) return '–'
  return `${fs || '–'} → ${fe || '–'}`
}

interface ProjetoListViewProps {
  projetos: ProjetoImplantacao[]
  onEdit?: (projeto: ProjetoImplantacao) => void
  onDelete?: (projeto: ProjetoImplantacao) => Promise<void>
}

export function ProjetoListView({ projetos, onEdit, onDelete }: ProjetoListViewProps) {
  const navigate = useNavigate()
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [deleteTarget, setDeleteTarget] = useState<ProjetoImplantacao | null>(null)
  const [deleting, setDeleting] = useState(false)

  const sortedProjetos = useMemo(() => {
    return [...projetos].sort((a, b) => {
      const valA = getSortValue(a, sortColumn)
      const valB = getSortValue(b, sortColumn)
      const cmp = valA.localeCompare(valB, 'pt-BR')
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [projetos, sortColumn, sortDirection])

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDelete) return
    setDeleting(true)
    try {
      await onDelete(deleteTarget)
      setDeleteTarget(null)
    } catch {
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <ScrollArea className="h-[calc(100vh-280px)] min-h-[300px] w-full">
          <Table>
            <TableHeader>
              <TableRow className="sticky top-0 z-10 bg-card hover:bg-card">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className="cursor-pointer select-none hover:bg-muted/50 transition-colors whitespace-nowrap"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortColumn === col.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[100px] text-center sticky top-0 z-10 bg-card">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProjetos.map((projeto) => {
                const prazosText = buildPrazosText(projeto)
                const hasClient = projeto.client && projeto.client.name
                return (
                  <TableRow
                    key={projeto.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/projetos-implantacao/${projeto.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[240px]">{projeto.name || '—'}</span>
                          {projeto.is_new_client && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                              Novo Cliente
                            </Badge>
                          )}
                        </div>
                        {hasClient && (
                          <span className="text-sm text-muted-foreground">
                            {projeto.client!.name}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {projeto.analyst?.nome || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {projeto.statusInfo && (
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: projeto.statusInfo.color }}
                          />
                        )}
                        <span className="text-xs whitespace-nowrap">
                          {projeto.statusInfo?.name || '—'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {prazosText || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEdit?.(projeto)
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(projeto)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!deleting) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto{' '}
              <strong className="text-foreground">{deleteTarget?.name}</strong>? Todos os registros
              associados — atividades, registros de horas, etapas, checklists e atribuições de
              analistas — serão permanentemente excluídos e não poderão ser recuperados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
