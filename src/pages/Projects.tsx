import { useState } from 'react'
import useMainStore, { Project } from '@/stores/main'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Edit2, Briefcase } from 'lucide-react'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { ProjectsDashboard } from '@/components/projects/ProjectsDashboard'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { getTaskHours, formatHoursAndMinutes } from '@/lib/time'
import { cn } from '@/lib/utils'

export default function Projects() {
  const {
    projects,
    clients,
    users,
    analysts,
    projectStatuses,
    tasks,
    addProject,
    updateProject,
    deleteProject,
  } = useMainStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()

  const handleCreate = () => {
    setEditingProject(undefined)
    setModalOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const handleSubmit = async (data: Omit<Project, 'id'>) => {
    if (editingProject) {
      updateProject(editingProject.id, data)
    } else {
      addProject(data as Project)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este projeto?')) {
      deleteProject(id)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground">Gerencie os projetos de implantação.</p>
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Novo Projeto
        </Button>
      </div>

      <ProjectsDashboard />

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Responsáveis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início Previsto</TableHead>
              <TableHead>Término Previsto</TableHead>
              <TableHead>Horas (Trab. / Contrat.)</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => {
                const client = clients.find((c) => c.id === project.clientId)
                const status = projectStatuses.find((s) => s.id === project.statusId)
                const pTasks = tasks.filter((t) => t.projectId === project.id)
                const hours = pTasks.reduce((acc, t) => acc + getTaskHours(t), 0)

                return (
                  <TableRow key={project.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        {project.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{client?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.analystIds?.length ? (
                          project.analystIds.map((aId) => {
                            const a =
                              analysts.find((an) => an.id === aId) ||
                              users.find((u) => u.id === aId)
                            return a ? (
                              <Badge key={aId} variant="secondary" className="text-xs font-normal">
                                {a.nome || a.name}
                              </Badge>
                            ) : null
                          })
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {status ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="text-sm">{status.name}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {project.forecastStart
                        ? (() => {
                            try {
                              return format(parseISO(project.forecastStart), 'dd/MM/yyyy')
                            } catch {
                              return '-'
                            }
                          })()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {project.forecastEnd
                        ? (() => {
                            try {
                              return format(parseISO(project.forecastEnd), 'dd/MM/yyyy')
                            } catch {
                              return '-'
                            }
                          })()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 min-w-[120px] max-w-[150px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{formatHoursAndMinutes(hours)}</span>
                          {(() => {
                            const contracted = project.contractedHours
                            return (
                              <span className="text-muted-foreground">
                                {contracted ? `${contracted}h` : '-'}
                              </span>
                            )
                          })()}
                        </div>
                        {(() => {
                          const contracted = project.contractedHours
                          if (!contracted) return null
                          const ratio = hours / contracted
                          const percent = Math.min(ratio * 100, 100)
                          let colorClass = 'bg-emerald-500'
                          if (ratio >= 1) colorClass = 'bg-red-500'
                          else if (ratio >= 0.75) colorClass = 'bg-yellow-500'

                          return (
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className={cn('h-full transition-all duration-500', colorClass)}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          )
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(project.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        project={editingProject}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
