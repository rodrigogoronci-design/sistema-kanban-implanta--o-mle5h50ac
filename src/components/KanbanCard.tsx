import { Task } from '@/stores/main'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useMainStore from '@/stores/main'

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
  const { users, clients } = useMainStore()
  const user = users.find((u) => u.id === task.responsibleId)
  const client = clients.find((c) => c.id === task.clientId)

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className="bg-card border shadow-sm rounded-lg p-3 cursor-grab active:cursor-grabbing card-hover-lift group flex flex-col gap-2 min-h-[100px]"
    >
      <div className="flex justify-between items-start">
        <Badge variant="outline" className={priorityColors[task.priority] || ''}>
          {task.priority}
        </Badge>
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
          {task.category}
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-sm leading-tight text-foreground group-hover:text-accent transition-colors">
          {task.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {client?.name || 'Cliente Desconhecido'}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          {task.checklist.length > 0 ? (
            <span className={task.checklist.every((c) => c.completed) ? 'text-accent' : ''}>
              {task.checklist.filter((c) => c.completed).length}/{task.checklist.length}
            </span>
          ) : (
            <span>-</span>
          )}
        </div>
        <Avatar className="h-6 w-6 border bg-muted">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="text-[10px]">{user?.name.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
