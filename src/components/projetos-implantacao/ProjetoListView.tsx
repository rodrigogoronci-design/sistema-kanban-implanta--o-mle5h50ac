import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUp, ArrowDown, ChevronsUpDown, Pencil } from 'lucide-react'
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
import type { ProjetoImplantacao } from '@/services/projetos-implantacao'

type SortColumn =
  | 'name'
  | 'client'
  | 'analyst'
  | 'status'
  | 'data_demanda'
  | 'forecast_start'
  | 'forecast_end'
  | 'priority'
  | 'is_new_client'

type SortDirection = 'asc' | 'desc'

const columns: { key: SortColumn; label: string }[] = [
  { key: 'name', label: 'Projeto' },
  { key: 'client', label: 'Cliente' },
  { key: 'analyst', label: 'Analista' },
  { key: 'status', label: 'Status' },
  { key: 'data_demanda', label: 'Data da Demanda' },
  { key: 'forecast_start', label: 'Previsão Início' },
  { key: 'forecast_end', label: 'Previsão Fim' },
  { key: 'priority', label: 'Prioridade' },
  { key: 'is_new_client', label: 'Novo Cliente' },
]

function getSortValue(projeto: ProjetoImplantacao, column: SortColumn): string {
  switch (column) {
    case 'name':
      return projeto.name?.toLowerCase() ?? ''
    case 'client':
      return projeto.client?.name?.toLowerCase() ?? ''
    case 'analyst':
      return projeto.analyst?.nome?.toLowerCase() ?? ''
    case 'status':
      return projeto.status?.toLowerCase() ?? ''
    case 'data_demanda':
      return projeto.data_demanda ?? ''
    case 'forecast_start':
      return projeto.forecast_start ?? ''
    case 'forecast_end':
      return projeto.forecast_end ?? ''
    case 'priority':
      return projeto.priority?.toLowerCase() ?? ''
    case 'is_new_client':
      return projeto.is_new_client ? '1' : '0'
  }
}

function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

interface ProjetoListViewProps {
  projetos: ProjetoImplantacao[]
  onEdit?: (projeto: ProjetoImplantacao) => void
}

export function ProjetoListView({ projetos, onEdit }: ProjetoListViewProps) {
  const navigate = useNavigate()
  const [sortColumn, setSortColumn] = useState<SortColumn>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

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

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
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
            <TableHead className="w-[60px] text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjetos.map((projeto) => (
            <TableRow
              key={projeto.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(`/projetos-implantacao/${projeto.id}`)}
            >
              <TableCell className="font-medium whitespace-nowrap">{projeto.name || '—'}</TableCell>
              <TableCell className="whitespace-nowrap">{projeto.client?.name || '—'}</TableCell>
              <TableCell className="whitespace-nowrap">{projeto.analyst?.nome || '—'}</TableCell>
              <TableCell>
                <Badge
                  variant={projeto.status === 'Ativo' ? 'default' : 'outline'}
                  className="text-xs"
                >
                  {projeto.status || '—'}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(projeto.data_demanda)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(projeto.forecast_start)}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatDate(projeto.forecast_end)}
              </TableCell>
              <TableCell className="whitespace-nowrap">{projeto.priority || '—'}</TableCell>
              <TableCell>
                {projeto.is_new_client ? (
                  <Badge variant="secondary" className="text-xs">
                    Sim
                  </Badge>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell className="text-center">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
