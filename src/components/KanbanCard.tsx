import { Task } from '@/stores/main'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useMainStore from '@/stores/main'
import { cn } from '@/lib/utils'
import { differenceInHours, isPast, parseISO, format } from 'date-fns'
import { Clock, CheckSquare, Paperclip } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getTaskHours } from '@/lib/time'

interface Props {
  task: Task
  onClick: () => void
  onDragStart: (e: React.DragEvent, id: string) => void
}

const priorityColors: Record<string, string> = {
  Alta: 'bg-red-100 text-red-800 border-red-200',
  Média: 'bg-amber-100 text-amber-800 border-amber-200',
  Baixa: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

export default function KanbanCard({ task, onClick, onDragStart }: Props) {
  const { users, clients, categories, updateTask } = useMainStore()
  const user = users.find((u) => u.id === task.responsibleId)
  const client = clients.find((c) => c.id === task.clientId)

  let isOverdue = false
  let isNearing = false
  let dueDateColor = ''

  if (task.dueDate) {
    const date = parseISO(task.dueDate)
    if (isPast(date) && differenceInHours(new Date(), date) > 0) {
      isOverdue = true
      dueDateColor = 'bg-destructive text-destructive-foreground border-destructive'
    } else {
      const hours = differenceInHours(date, new Date())
      if (hours <= 48 && hours >= 0) {
        isNearing = true
        dueDateColor = 'bg-yellow-500 text-yellow-950 border-yellow-600'
      } else {
        dueDateColor = 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }
    }
  }

  const borderClass = isOverdue
    ? 'border-l-destructive'
    : isNearing
      ? 'border-l-yellow-500'
      : task.dueDate
        ? 'border-l-emerald-500'
        : 'border-l-transparent'

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className={cn(
        'bg-card border-y border-r shadow-sm rounded-lg p-3 cursor-grab active:cursor-grabbing card-hover-lift group flex flex-col gap-2 min-h-[100px] border-l-4',
        borderClass,
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-wrap gap-1.5 items-center">
          <Badge variant="outline" className={priorityColors[task.priority] || ''}>
            {task.priority}
          </Badge>
          {task.dueDate && (
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0 h-5 font-semibold', dueDateColor)}
            >
              {format(parseISO(task.dueDate), 'dd/MM')}
            </Badge>
          )}
        </div>
        <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1.5 max-w-[120px] truncate">
          {(() => {
            const category = categories.find((c) => c.id === task.categoryId)
            if (!category) return 'Sem Categoria'
            return (
              <>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="truncate">{category.name}</span>
              </>
            )
          })()}
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-sm leading-tight text-foreground group-hover:text-primary transition-colors">
          {task.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {client?.name || 'Cliente Desconhecido'}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          {task.checklist.length > 0 && (
            <div className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5" />
              <span
                className={
                  task.checklist.every((c) => c.completed) ? 'text-primary font-semibold' : ''
                }
              >
                {task.checklist.filter((c) => c.completed).length}/{task.checklist.length}
              </span>
            </div>
          )}

          {(task.attachments?.length ?? 0) > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{task.attachments!.length}</span>
            </div>
          )}

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors bg-secondary/50 px-1.5 py-0.5 rounded-md">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-semibold">{getTaskHours(task).toFixed(1)}h</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Adicionar Horas</h4>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.5"
                      min="0.1"
                      placeholder="Ex: 2.5"
                      className="h-8 text-sm"
                      id={`hours-${task.id}`}
                    />
                    <Button
                      size="sm"
                      className="h-8 shrink-0"
                      onClick={() => {
                        const input = document.getElementById(
                          `hours-${task.id}`,
                        ) as HTMLInputElement
                        const val = parseFloat(input.value)
                        if (!isNaN(val) && val > 0) {
                          const end = new Date()
                          const start = new Date(end.getTime() - val * 60 * 60 * 1000)
                          const newEntry = {
                            id: Math.random().toString(),
                            start: start.toISOString(),
                            end: end.toISOString(),
                            observation: 'Lançamento via card',
                          }
                          updateTask(task.id, {
                            timeEntries: [...(task.timeEntries || []), newEntry],
                          })
                          input.value = ''
                          document.dispatchEvent(new MouseEvent('mousedown'))
                        }
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Avatar className="h-6 w-6 border bg-muted">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="text-[10px]">{user?.name.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
