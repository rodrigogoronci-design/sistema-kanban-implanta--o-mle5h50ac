import { useMemo, useState } from 'react'
import useMainStore, { Project } from '@/stores/main'
import TaskModal from '@/components/TaskModal'
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
import { getTaskHours, formatHoursAndMinutes } from '@/lib/time'
import { Calendar, Clock, AlertCircle, CheckCircle, ListTodo } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Props {
  project: Project
}

export function ProjectTasksTab({ project }: Props) {
  const { tasks, columns, analysts } = useMainStore()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const projectTasks = useMemo(() => {
    const pTasks = tasks?.filter((t) => t.projectId === project.id) || []
    return pTasks.sort((a, b) => {
      const aCompleted = !!(a.completionDate || a.completion_date)
      const bCompleted = !!(b.completionDate || b.completion_date)

      if (aCompleted !== bCompleted) {
        return aCompleted ? 1 : -1 // Pending (false) first
      }

      const aDate = new Date(a.createdAt || a.created_at || 0).getTime()
      const bDate = new Date(b.createdAt || b.created_at || 0).getTime()

      return bDate - aDate // Newest first
    })
  }, [tasks, project.id])

  const { pendingCount, completedCount } = useMemo(() => {
    let pending = 0
    let completed = 0
    projectTasks.forEach((t) => {
      if (t.completionDate || t.completion_date) {
        completed++
      } else {
        pending++
      }
    })
    return { pendingCount: pending, completedCount: completed }
  }, [projectTasks])

  const getSafeHours = (task: any) => {
    let hours = 0
    try {
      hours = getTaskHours(task) || 0
    } catch (e) {
      // ignore error
    }

    if (!hours && task.timeEntries && Array.isArray(task.timeEntries)) {
      hours = task.timeEntries.reduce((acc: number, entry: any) => {
        const startStr = entry.start || entry.startTime || entry.start_time
        const endStr = entry.end || entry.endTime || entry.end_time
        if (!startStr || !endStr) return acc
        const start = new Date(startStr).getTime()
        const end = new Date(endStr).getTime()
        return acc + (end - start) / (1000 * 60 * 60)
      }, 0)
    }
    return isNaN(hours) ? 0 : hours
  }

  const totalHours = useMemo(() => {
    return projectTasks.reduce((acc, t) => acc + getSafeHours(t), 0)
  }, [projectTasks])

  const getStatusBadgeStyle = (title: string, isCompleted: boolean) => {
    const lowerTitle = title.toLowerCase()
    if (isCompleted || lowerTitle.includes('concluíd') || lowerTitle.includes('finalizad')) {
      return 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20'
    }
    if (lowerTitle.includes('andamento') || lowerTitle.includes('fazendo')) {
      return 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20'
    }
    if (
      lowerTitle.includes('pendente') ||
      lowerTitle.includes('fazer') ||
      lowerTitle.includes('backlog')
    ) {
      return 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20'
    }
    return 'bg-background shadow-sm'
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-md">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold">Horas Lançadas</div>
              <div className="text-xs text-muted-foreground mt-0.5">Total em atividades</div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-lg px-3 py-1 font-mono bg-background border shadow-sm"
          >
            {formatHoursAndMinutes(totalHours)}
          </Badge>
        </div>

        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-md">
              <ListTodo className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-sm font-semibold">Tarefas Pendentes</div>
              <div className="text-xs text-muted-foreground mt-0.5">Atividades em aberto</div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-lg px-3 py-1 font-mono bg-background border shadow-sm"
          >
            {pendingCount}
          </Badge>
        </div>

        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-md">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-semibold">Tarefas Concluídas</div>
              <div className="text-xs text-muted-foreground mt-0.5">Atividades finalizadas</div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="text-lg px-3 py-1 font-mono bg-background border shadow-sm"
          >
            {completedCount}
          </Badge>
        </div>
      </div>

      <div className="border rounded-md bg-background overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[30%]">Título</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Data de Realização</TableHead>
              <TableHead className="text-right">Horas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
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
                const column = columns?.find((c) => c.id === task.columnId)
                const analyst = analysts?.find((a) => a.id === task.responsibleId)
                const hours = getSafeHours(task)

                const isCompleted = !!(task.completionDate || task.completion_date)
                const isHighPriority = task.priority === 'Alta' || task.priority === 'Urgente'

                return (
                  <TableRow
                    key={task.id}
                    className={cn(
                      'group hover:bg-muted transition-colors cursor-pointer',
                      isCompleted && 'opacity-60',
                    )}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {isHighPriority && !isCompleted && (
                          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        )}
                        <span
                          className={cn(
                            'line-clamp-2',
                            isCompleted && 'line-through text-muted-foreground',
                          )}
                          title={task.title}
                        >
                          {task.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {column ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-normal whitespace-nowrap',
                            getStatusBadgeStyle(column.title, isCompleted),
                          )}
                        >
                          {column.title}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {analyst ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7 border">
                            <AvatarImage src={analyst.avatar_url || analyst.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {(analyst.nome || analyst.name || 'A').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={cn(
                              'text-sm truncate max-w-[120px]',
                              isCompleted && 'text-muted-foreground',
                            )}
                            title={analyst.nome || analyst.name}
                          >
                            {analyst.nome || analyst.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {task.completionDate || task.completion_date ? (
                        <div className="flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(
                            parseISO(task.completionDate || task.completion_date),
                            'dd/MM/yyyy',
                          )}
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
                        {formatHoursAndMinutes(hours)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTaskId && (
        <TaskModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  )
}
