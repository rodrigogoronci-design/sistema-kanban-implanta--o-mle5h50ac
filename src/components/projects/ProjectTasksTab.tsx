import { useMemo } from 'react'
import useMainStore, { Project } from '@/stores/main'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { getTaskHours } from '@/lib/time'
import { Calendar, Clock, User2, AlertCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Props {
  project: Project
}

export function ProjectTasksTab({ project }: Props) {
  const { tasks, columns, users } = useMainStore()

  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === project.id)
  }, [tasks, project.id])

  const totalHours = useMemo(() => {
    return projectTasks.reduce((acc, t) => {
      try {
        return acc + (getTaskHours(t) || 0)
      } catch {
        return acc
      }
    }, 0)
  }, [projectTasks])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-md">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-semibold">Horas Lançadas</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Total de horas em atividades deste projeto
            </div>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="text-lg px-4 py-1.5 font-mono bg-background border shadow-sm"
        >
          {totalHours.toFixed(1)}h
        </Badge>
      </div>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[30%]">Título</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Horas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-4 rounded-full bg-muted/50">
                      <Calendar className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">Nenhuma atividade vinculada</p>
                    <p className="text-xs opacity-70 max-w-[250px] text-center">
                      As atividades criadas no quadro Kanban com este projeto vinculado aparecerão
                      aqui.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              projectTasks.map((task) => {
                const column = columns.find((c) => c.id === task.columnId)
                const user = users.find((u) => u.id === task.responsibleId)
                let hours = 0
                try {
                  hours = getTaskHours(task) || 0
                } catch (e) {
                  // ignore
                }

                const isHighPriority = task.priority === 'Alta' || task.priority === 'Urgente'
                const isMediumPriority = task.priority === 'Média'

                return (
                  <TableRow key={task.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isHighPriority && (
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                        <span className="line-clamp-2" title={task.title}>
                          {task.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {column ? (
                        <Badge
                          variant="outline"
                          className="font-normal bg-background shadow-sm whitespace-nowrap"
                        >
                          {column.title}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isHighPriority
                            ? 'destructive'
                            : isMediumPriority
                              ? 'default'
                              : 'secondary'
                        }
                        className={cn(
                          'font-normal shadow-none whitespace-nowrap',
                          isMediumPriority &&
                            'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20',
                          !isHighPriority && !isMediumPriority && 'bg-muted text-muted-foreground',
                        )}
                      >
                        {task.priority || 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border">
                            <AvatarImage src={user.avatar_url || user.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {(user.nome || user.name || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className="text-sm truncate max-w-[120px]"
                            title={user.nome || user.name}
                          >
                            {user.nome || user.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className="flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(parseISO(task.dueDate), 'dd/MM/yyyy')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className="font-mono bg-muted group-hover:bg-background transition-colors"
                      >
                        {hours.toFixed(1)}h
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
