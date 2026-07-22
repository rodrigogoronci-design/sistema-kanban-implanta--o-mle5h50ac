import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { AtividadeWithRelations } from '@/services/minhas-atividades'

interface Props {
  activities: AtividadeWithRelations[]
  onSelect: (a: AtividadeWithRelations) => void
}

const parseLocal = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function CalendarView({ activities, onSelect }: Props) {
  const [month, setMonth] = useState(new Date())

  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start, end })

  const forDay = (day: Date) =>
    activities.filter((a) => {
      if (a.forecast_date && isSameDay(parseLocal(a.forecast_date), day)) return true
      if (a.realization_date && isSameDay(parseLocal(a.realization_date), day)) return true
      return false
    })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold capitalize">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const items = forDay(day)
          const inMonth = isSameMonth(day, month)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[80px] border rounded-lg p-1 text-xs',
                !inMonth && 'bg-muted/30 opacity-50',
              )}
            >
              <div className="text-right text-muted-foreground mb-1">{format(day, 'd')}</div>
              <div className="space-y-0.5">
                {items.slice(0, 3).map((a) => {
                  const isForecast = a.forecast_date && isSameDay(parseLocal(a.forecast_date), day)
                  return (
                    <button
                      key={a.id + (isForecast ? '-f' : '-r')}
                      onClick={() => onSelect(a)}
                      className={cn(
                        'block w-full text-left text-[10px] truncate px-1 py-0.5 rounded',
                        isForecast
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200',
                      )}
                    >
                      {a.name}
                    </button>
                  )
                })}
                {items.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{items.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
