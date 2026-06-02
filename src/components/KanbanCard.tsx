import { Badge } from '@/components/ui/badge'
import { Clock, Paperclip, MessageSquare, CalendarClock, Check, Video } from 'lucide-react'
import useMainStore from '@/stores/main'
import { getTaskHours, formatHoursAndMinutes } from '@/lib/time'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'

interface KanbanCardProps {
  task: any
  onClick: () => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
}

export default function KanbanCard({ task, onClick, onDragStart }: KanbanCardProps) {
  const { clients, analysts, categories, timeEntries, updateTask, columns } = useMainStore()

  const client = clients?.find((c) => c.id === task.clientId)
  const category = categories?.find((c) => c.id === task.categoryId)

  let totalHours = 0
  try {
    totalHours = getTaskHours(task) || 0
  } catch (e) {
    // ignore error
  }

  if (!totalHours && timeEntries && Array.isArray(timeEntries)) {
    const taskTimeEntries = timeEntries.filter((t: any) => t.taskId === task.id)
    totalHours = taskTimeEntries.reduce((acc: number, entry: any) => {
      if (!entry.startTime || !entry.endTime) return acc
      const start = new Date(entry.startTime).getTime()
      const end = new Date(entry.endTime).getTime()
      return acc + (end - start) / (1000 * 60 * 60)
    }, 0)
  }

  if (isNaN(totalHours)) totalHours = 0

  const handleComplete = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    const completedCol = columns?.find(
      (c) =>
        c.title.toLowerCase().includes('concluíd') || c.title.toLowerCase().includes('concluid'),
    )
    if (completedCol) {
      updateTask(task.id, { columnId: completedCol.id })
    } else if (columns && columns.length > 0) {
      const lastCol = columns[columns.length - 1]
      if (lastCol) updateTask(task.id, { columnId: lastCol.id })
    }
  }

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
    <>
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
          <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors pr-16">
            {task.title}
          </h4>
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {totalHours > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 font-mono flex items-center gap-1 group-hover:hidden"
                title="Total de horas na tarefa"
              >
                <Clock className="w-2.5 h-2.5" />
                {formatHoursAndMinutes(totalHours)}
              </Badge>
            )}
            <div className="hidden group-hover:flex items-center gap-0.5 bg-background/90 backdrop-blur-sm rounded-md p-0.5 shadow-sm border">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100"
                onClick={handleComplete}
                title="Concluir"
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
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
          {(task.trainingModality || task.training_modality) &&
            category?.name?.toLowerCase().includes('treinamento') && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 h-4 bg-muted/50 border-muted-foreground/20 text-muted-foreground"
              >
                {(task.trainingModality || task.training_modality) === 'Remoto'
                  ? '💻 Remoto'
                  : '🏢 Presencial'}
              </Badge>
            )}
          {(task.recordingUrl || task.recording_url) && (
            <a
              href={task.recordingUrl || task.recording_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-1 rounded-md transition-colors"
              title="Ver Gravação"
            >
              <Video className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t text-muted-foreground">
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {task.responsibleIds && task.responsibleIds.length > 0 ? (
              task.responsibleIds.map((aId: string) => {
                const a = analysts?.find((an) => an.id === aId)
                return a ? (
                  <div
                    key={aId}
                    className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[10px]"
                    title={`Responsável: ${a.nome}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {a.nome.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate max-w-[60px]">{a.nome.split(' ')[0]}</span>
                  </div>
                ) : null
              })
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
    </>
  )
}
