import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
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
import { cn } from '@/lib/utils'
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

type SortColumn = 'name' | 'analyst' | 'prazos'
type SortDirection = 'asc' | 'desc'

interface StatusInfo {
  id: string
  name: string
  color: string
  position?: number | null
}

interface ProjetoListViewProps {
  projetos: ProjetoImplantacao[]
  projectStatuses: StatusInfo[]
  statusFilter: string
  onEdit?: (projeto: ProjetoImplantacao) => void
  onDelete?: (projeto: ProjetoImplantacao) => Promise<void>
}

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'name', label: 'Projeto' },
  { key: 'analyst', label: 'Analista' },
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

export function ProjetoListView({
  projetos,
  projectStatuses,
  statusFilter,
  onEdit,
  onDelete,
}: ProjetoListViewProps) {
  const navigate = useNavigate()
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [deleteTarget, setDeleteTarget] = useState<ProjetoImplantacao | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (statusFilter === 'all') {
      setCollapsed({})
    }
  }, [statusFilter])

  const groups = useMemo(() => {
    const sortedStatuses = [...projectStatuses].sort(
      (a, b) => (a.position ?? 999) - (b.position ?? 999),
    )

    const statusGroups = sortedStatuses.map((status) => ({
      id: status.id,
      title: status.name,
      color: status.color,
      items: projetos.filter((p) => p.status_id === status.id),
    }))

    const knownStatusIds = new Set(sortedStatuses.map((s) => s.id))
    const otherItems = projetos.filter((p) => !p.status_id || !knownStatusIds.has(p.status_id))

    const allGroups = [
      ...statusGroups,
      ...(otherItems.length > 0
        ? [{ id: 'outros', title: 'Outros', color: '#9ca3af', items: otherItems }]
        : []),
    ]

    if (statusFilter !== 'all') {
      return allGroups.filter((g) => g.id === statusFilter)
    }
    return allGroups.filter((g) => g.items.length > 0)
  }, [projetos, projectStatuses, statusFilter])

  const sortItems = (items: ProjetoImplantacao[]) =>
    [...items].sort((a, b) => {
      const valA = getSortValue(a, sortColumn)
      const valB = getSortValue(b, sortColumn)
      const cmp = valA.localeCompare(valB, 'pt-BR')
      return sortDirection === 'asc' ? cmp : -cmp
    })

  const isGroupCollapsed = (groupId: string) => {
    if (statusFilter !== 'all') return false
    return collapsed[groupId] ?? true
  }

  const toggleGroup = (groupId: string) =>
    setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }))

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

  const SortIcon = ({ column }: { column: SortColumn }) =>
    sortColumn !== column ? (
      <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
    ) : sortDirection === 'asc' ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    )

  return (
    <>
      <div className="space-y-2">
        {groups.map((group) => {
          const groupCollapsed = isGroupCollapsed(group.id)
          const sortedItems = sortItems(group.items)
          return (
            <div key={group.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/80 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {groupCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: group.color }}
                    />
                    <span className="text-sm font-medium">{group.title}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {group.items.length}
                  </Badge>
                </div>
              </button>

              {!groupCollapsed && sortedItems.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      {COLUMNS.map((col) => (
                        <TableHead
                          key={col.key}
                          className="cursor-pointer select-none hover:bg-muted/50 transition-colors whitespace-nowrap py-2"
                          onClick={() => handleSort(col.key)}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            <SortIcon column={col.key} />
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="w-[100px] text-center py-2">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedItems.map((projeto) => {
                      const prazosText = buildPrazosText(projeto)
                      const hasClient = projeto.client && projeto.client.name
                      return (
                        <TableRow
                          key={projeto.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => navigate(`/projetos-implantacao/${projeto.id}`)}
                        >
                          <TableCell className="font-medium py-2">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate max-w-[240px]">
                                  {projeto.name || '—'}
                                </span>
                                {projeto.is_new_client && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0 shrink-0"
                                  >
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
                          <TableCell className="whitespace-nowrap py-2">
                            {projeto.analyst?.nome || '—'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground py-2">
                            {prazosText || '—'}
                          </TableCell>
                          <TableCell className="text-center py-2">
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
              )}

              {!groupCollapsed && sortedItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Nenhum projeto nesta seção.
                </p>
              )}
            </div>
          )
        })}
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
