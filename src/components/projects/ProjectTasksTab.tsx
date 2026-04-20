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

interface Props {
  project: Project
}

export function ProjectTasksTab({ project }: Props) {
  const { tasks, columns, users } = useMainStore()

  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === project.id)
  }, [tasks, project.id])

  const totalHours = useMemo(() => {
    return projectTasks.reduce((acc, t) => acc + getTaskHours(t), 0)
  }, [projectTasks])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-muted/50 p-4 rounded-lg border">
        <div className="text-sm font-medium">Total de Horas nas Atividades</div>
        <Badge variant="secondary" className="text-base px-3 py-1 font-mono">
          {totalHours.toFixed(1)}h
        </Badge>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Coluna</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Horas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhuma atividade vinculada a este projeto.
                </TableCell>
              </TableRow>
            ) : (
              projectTasks.map((task) => {
                const column = columns.find((c) => c.id === task.columnId)
                const user = users.find((u) => u.id === task.responsibleId)
                const hours = getTaskHours(task)

                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{column?.title || '-'}</TableCell>
                    <TableCell>{user?.nome || user?.name || '-'}</TableCell>
                    <TableCell>
                      {task.dueDate ? format(parseISO(task.dueDate), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">{hours.toFixed(1)}h</TableCell>
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
