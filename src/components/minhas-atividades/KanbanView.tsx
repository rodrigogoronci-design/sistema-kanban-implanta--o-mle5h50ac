import { useState, useRef } from 'react'
import { CalendarClock, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AtividadeWithRelations } from '@/services/minhas-atividades'

interface Props {
  activities: AtividadeWithRelations[]
  onSelect: (a: AtividadeWithRelations) => void
  onDrop: (id: string, targetStatus: string) => Promise<void>
}

const fmt = (d: string | null) => (d ? d.split('-').reverse().join('/') : null)

const COLS = [
  {
    title: 'A Fazer',
    status: 'A Fazer',
    filter: (a: AtividadeWithRelations) => a.status === 'A Fazer' && !a.is_completed,
  },
  {
    title: 'Em Andamento',
    status: 'Em Andamento',
    filter: (a: AtividadeWithRelations) => a.status === 'Em Andamento' && !a.is_completed,
  },
  {
    title: 'Aguardando Cliente',
    status: 'Aguardando Cliente',
    filter: (a: AtividadeWithRelations) => a.status === 'Aguardando Cliente' && !a.is_completed,
  },
  {
    title: 'Aguardando Desenvolvimento',
    status: 'Aguardando Desenvolvimento',
    filter: (a: AtividadeWithRelations) =>
      a.status === 'Aguardando Desenvolvimento' && !a.is_completed,
  },
  {
    title: 'Concluído',
    status: 'Concluído',
    filter: (a: AtividadeWithRelations) => a.is_completed || a.status === 'Concluído',
  },
]

export function KanbanView({ activities, onSelect, onDrop }: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [isDropping, setIsDropping] = useState(false)
  const dragOffset = useRef(0)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverCol(null)
  }

  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colStatus) setDragOverCol(colStatus)
  }

  const handleDragLeave = (e: React.DragEvent, colStatus: string) => {
    const related = e.relatedTarget as HTMLElement | null
    const currentTarget = e.currentTarget as HTMLElement
    if (!related || !currentTarget.contains(related)) {
      if (dragOverCol === colStatus) setDragOverCol(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, colStatus: string) => {
    e.preventDefault()
    const id = draggedId || e.dataTransfer.getData('text/plain')
    setDragOverCol(null)
    setIsDropping(true)
    try {
      await onDrop(id, colStatus)
    } finally {
      setIsDropping(false)
      setDraggedId(null)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLS.map((col) => {
        const items = activities.filter(col.filter)
        const isDragOver = dragOverCol === col.status
        return (
          <div
            key={col.title}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={(e) => handleDragLeave(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={cn(
              'rounded-xl p-3 flex flex-col gap-2 min-h-[300px] min-w-[260px] flex-1 transition-all duration-200',
              isDragOver ? 'bg-primary/10 ring-2 ring-primary/40 ring-offset-1' : 'bg-muted/30',
            )}
          >
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-medium text-sm whitespace-nowrap">{col.title}</h3>
              <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>
            <div className="space-y-2 flex-1">
              {items.length === 0 ? (
                <div
                  className={cn(
                    'text-xs text-muted-foreground text-center py-4 border-2 border-dashed rounded-lg transition-colors',
                    isDragOver && 'border-primary/50 text-primary',
                  )}
                >
                  {isDragOver ? 'Solte aqui' : 'Nenhuma atividade'}
                </div>
              ) : (
                items.map((a) => (
                  <div
                    key={a.id}
                    draggable={!isDropping}
                    onDragStart={(e) => handleDragStart(e, a.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelect(a)}
                    className={cn(
                      'bg-background rounded-lg border p-3 cursor-grab hover:border-primary/40 hover:shadow-md active:cursor-grabbing transition-all duration-200',
                      draggedId === a.id && 'opacity-40 scale-95',
                    )}
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="w-3 h-3 text-muted-foreground/40 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
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
                    </div>
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
