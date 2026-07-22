import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { AtividadeWithRelations } from '@/services/minhas-atividades'

interface Props {
  activities: AtividadeWithRelations[]
  onSelect: (a: AtividadeWithRelations) => void
}

type SortField = 'name' | 'projeto_name' | 'client_name' | 'forecast_date' | 'status'

const fmt = (d: string | null) => (d ? d.split('-').reverse().join('/') : '-')

export function ListView({ activities, onSelect }: Props) {
  const [sortField, setSortField] = useState<SortField>('forecast_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortField(f)
      setSortDir('asc')
    }
  }

  const sorted = [...activities].sort((a, b) => {
    const cmp = String(a[sortField] || '').localeCompare(String(b[sortField] || ''))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const Icon = ({ field }: { field: SortField }) =>
    sortField !== field ? (
      <ArrowUpDown className="w-3 h-3 ml-1 inline opacity-50" />
    ) : sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 inline" />
    )

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead
              className="py-2 cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('name')}
            >
              Atividade
              <Icon field="name" />
            </TableHead>
            <TableHead
              className="py-2 cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('projeto_name')}
            >
              Projeto
              <Icon field="projeto_name" />
            </TableHead>
            <TableHead
              className="py-2 cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('client_name')}
            >
              Cliente
              <Icon field="client_name" />
            </TableHead>
            <TableHead
              className="py-2 cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('forecast_date')}
            >
              Prazo
              <Icon field="forecast_date" />
            </TableHead>
            <TableHead
              className="py-2 cursor-pointer hover:bg-muted/80"
              onClick={() => handleSort('status')}
            >
              Status
              <Icon field="status" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                Nenhuma atividade encontrada.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((a) => (
              <TableRow
                key={a.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onSelect(a)}
              >
                <TableCell className="py-2 text-sm font-medium">{a.name}</TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {a.projeto_name || '-'}
                </TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {a.client_name || '-'}
                </TableCell>
                <TableCell className="py-2 text-sm">{fmt(a.forecast_date)}</TableCell>
                <TableCell className="py-2">
                  {a.is_completed || a.status === 'Concluído' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Concluído</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {a.status}
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
