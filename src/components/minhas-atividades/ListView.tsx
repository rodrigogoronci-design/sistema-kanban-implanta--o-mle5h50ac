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
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AtividadeWithRelations } from '@/services/minhas-atividades'

interface Props {
  activities: AtividadeWithRelations[]
  onSelect: (a: AtividadeWithRelations) => void
}

type SortField = 'name' | 'projeto_name' | 'client_name' | 'forecast_date' | 'status'

const fmt = (d: string | null) => (d ? d.split('-').reverse().join('/') : '-')

const STATUS_GROUPS: { title: string; badgeClass: string }[] = [
  { title: 'A Fazer', badgeClass: 'bg-slate-100 text-slate-600' },
  { title: 'Em Andamento', badgeClass: 'bg-blue-100 text-blue-700' },
  { title: 'Aguardando Cliente', badgeClass: 'bg-amber-100 text-amber-700' },
  { title: 'Aguardando Desenvolvimento', badgeClass: 'bg-purple-100 text-purple-700' },
  { title: 'Concluído', badgeClass: 'bg-emerald-100 text-emerald-700' },
]

export function ListView({ activities, onSelect }: Props) {
  const [sortField, setSortField] = useState<SortField>('forecast_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    STATUS_GROUPS.forEach((g) => {
      initial[g.title] = true
    })
    initial['Outros'] = true
    return initial
  })

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortField(f)
      setSortDir('asc')
    }
  }

  const sortItems = (items: AtividadeWithRelations[]) =>
    [...items].sort((a, b) => {
      const cmp = String(a[sortField] || '').localeCompare(String(b[sortField] || ''))
      return sortDir === 'asc' ? cmp : -cmp
    })

  const Icon = ({ field }: { field: SortField }) =>
    sortField !== field ? (
      <span className="inline opacity-50 ml-1">↕</span>
    ) : sortDir === 'asc' ? (
      <span className="inline ml-1">↑</span>
    ) : (
      <span className="inline ml-1">↓</span>
    )

  const toggleGroup = (title: string) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }))

  const grouped = STATUS_GROUPS.map((g) => ({
    ...g,
    items: sortItems(
      activities.filter((a) =>
        g.title === 'Concluído'
          ? a.is_completed || a.status === 'Concluído'
          : a.status === g.title && !a.is_completed,
      ),
    ),
  }))

  const otherItems = sortItems(
    activities.filter((a) => {
      const isConcluido = a.is_completed || a.status === 'Concluído'
      if (isConcluido) return false
      return !STATUS_GROUPS.some((g) => g.title !== 'Concluído' && a.status === g.title)
    }),
  )

  const groups = [
    ...grouped,
    ...(otherItems.length > 0
      ? [{ title: 'Outros', badgeClass: 'bg-gray-100 text-gray-600', items: otherItems }]
      : []),
  ]

  return (
    <div className="space-y-2">
      {groups.map((group) => {
        const isCollapsed = collapsed[group.title]
        return (
          <div key={group.title} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
                <Badge className={cn('text-xs', group.badgeClass)}>{group.title}</Badge>
              </div>
              <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                {group.items.length}
              </span>
            </button>

            {!isCollapsed && group.items.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead
                      className="py-2 cursor-pointer hover:bg-muted/60 text-xs"
                      onClick={() => handleSort('name')}
                    >
                      Atividade
                      <Icon field="name" />
                    </TableHead>
                    <TableHead
                      className="py-2 cursor-pointer hover:bg-muted/60 text-xs"
                      onClick={() => handleSort('projeto_name')}
                    >
                      Projeto
                      <Icon field="projeto_name" />
                    </TableHead>
                    <TableHead
                      className="py-2 cursor-pointer hover:bg-muted/60 text-xs"
                      onClick={() => handleSort('client_name')}
                    >
                      Cliente
                      <Icon field="client_name" />
                    </TableHead>
                    <TableHead
                      className="py-2 cursor-pointer hover:bg-muted/60 text-xs"
                      onClick={() => handleSort('forecast_date')}
                    >
                      Prazo
                      <Icon field="forecast_date" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.items.map((a) => (
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {!isCollapsed && group.items.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhuma atividade nesta seção.
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
