import { CalendarClock } from 'lucide-react'
import { AtividadeWithRelations } from '@/services/minhas-atividades'

interface Props {
  activities: AtividadeWithRelations[]
  onSelect: (a: AtividadeWithRelations) => void
}

const fmt = (d: string | null) => (d ? d.split('-').reverse().join('/') : null)

const COLS = [
  {
    title: 'A Fazer',
    filter: (a: AtividadeWithRelations) => a.status === 'A Fazer' && !a.is_completed,
  },
  {
    title: 'Em Andamento',
    filter: (a: AtividadeWithRelations) =>
      !a.is_completed && a.status !== 'A Fazer' && a.status !== 'Concluído',
  },
  {
    title: 'Concluído',
    filter: (a: AtividadeWithRelations) => a.is_completed || a.status === 'Concluído',
  },
]

export function KanbanView({ activities, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLS.map((col) => {
        const items = activities.filter(col.filter)
        return (
          <div
            key={col.title}
            className="bg-muted/30 rounded-xl p-3 flex flex-col gap-2 min-h-[300px]"
          >
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-medium text-sm">{col.title}</h3>
              <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <div className="space-y-2 flex-1">
              {items.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhuma atividade</p>
              ) : (
                items.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onSelect(a)}
                    className="bg-background rounded-lg border p-3 cursor-pointer hover:border-primary/40 transition-colors"
                  >
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    {a.projeto_name && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {a.projeto_name}
                      </p>
                    )}
                    {a.client_name && (
                      <p className="text-xs text-muted-foreground truncate">{a.client_name}</p>
                    )}
                    {a.forecast_date && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                        <CalendarClock className="w-3 h-3" /> {fmt(a.forecast_date)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
