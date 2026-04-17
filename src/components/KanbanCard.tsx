import { Badge } from '@/components/ui/badge'
import { Clock, Paperclip, MessageSquare, CalendarClock } from 'lucide-react'
import useMainStore from '@/stores/main'
import { getTaskHours } from '@/lib/time'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'

interface KanbanCardProps {
  task: any
  onClick: () => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
}

export default function KanbanCard({ task, onClick, onDragStart }: KanbanCardProps) {
  const { clients, analysts, categories } = useMainStore()

  const client = clients.find((c) => c.id === task.clientId)
  const analyst = analysts.find((a) => a.id === task.responsibleId)
  const category = categories.find((c) => c.id === task.categoryId)
  const totalHours = getTaskHours(task)

  let deadlineClass = ''
  if (task.dueDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(task.dueDate)
    dueDate.setHours(0, 0, 0, 0)

    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      deadlineClass = 'border-t-4 border-t-destructive'
    } else if (diffDays <= 2) {
      deadlineClass = 'border-t-4 border-t-yellow-500'
    } else {
      deadlineClass = 'border-t-4 border-t-green-500'
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className={cn(
        'bg-background p-3 rounded-lg border shadow-sm cursor-pointer hover:border-primary/50 transition-colors flex flex-col gap-2 group relative',
        deadlineClass,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors pr-10">
          {task.title}
        </h4>
        {totalHours > 0 && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 text-[10px] px-1.5 py-0 h-4 font-mono flex items-center gap-1"
            title="Total de horas na tarefa"
          >
            <Clock className="w-2.5 h-2.5" />
            {totalHours.toFixed(1)}h
          </Badge>
        )}
      </div>

      {client && <div className="text-xs text-muted-foreground truncate">{client.name}</div>}

      {(task.scheduledDate || task.scheduledTime) && (
        <div className="flex items-center gap-1.5 text-[11px] text-blue-700 bg-blue-50/80 w-fit px-1.5 py-0.5 rounded border border-blue-200 mt-0.5 font-medium">
          <CalendarClock className="w-3 h-3" />
          <span>
            {task.scheduledDate && format(parseISO(task.scheduledDate), 'dd/MM/yyyy')}
            {task.scheduledDate && task.scheduledTime && ' às '}
            {task.scheduledTime && task.scheduledTime.slice(0, 5)}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        {category && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4"
            style={{ backgroundColor: category.color + '20', color: category.color }}
          >
            {category.name}
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
          {task.priority || 'Média'}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          {analyst ? (
            <div
              className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[10px]"
              title={`Responsável: ${analyst.nome}`}
            >
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {analyst.nome.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[60px]">{analyst.nome.split(' ')[0]}</span>
            </div>
          ) : (
            <span className="text-[10px] italic text-muted-foreground/70">Não atribuído</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
          {task.comments && task.comments.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
