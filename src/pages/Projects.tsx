import { useState, useEffect } from 'react'
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
import { getTaskHours } from '@/lib/time'
import { supabase } from '@/lib/supabase/client'

export default function Projects() {
  const {
    projects,
    clients,
    users,
    projectStatuses,
    tasks,
    addProject,
    updateProject,
    deleteProject,
  } = useMainStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [analysts, setAnalysts] = useState<any[]>([])
  const [pendingDatesUpdate, setPendingDatesUpdate] = useState<{
    name: string
    clientId: string
    payload: any
  } | null>(null)

  useEffect(() => {
    if (pendingDatesUpdate && projects.length > 0) {
      const match = projects.find(
        (p) => p.name === pendingDatesUpdate.name && p.clientId === pendingDatesUpdate.clientId,
      )
      if (match) {
        const payload = pendingDatesUpdate.payload
        setPendingDatesUpdate(null)

        const updateDates = async () => {
          for (let i = 0; i < 5; i++) {
            const { data } = await supabase
              .from('projects')
              .select('id')
              .eq('id', match.id)
              .single()
            if (data) {
              await supabase.from('projects').update(payload).eq('id', match.id)
              break
            }
            await new Promise((r) => setTimeout(r, 1000))
          }
        }
        updateDates()
      }
    }
  }, [projects, pendingDatesUpdate])

  useEffect(() => {
    supabase
      .from('analistas')
      .select('id, nome')
      .then(({ data }) => {
        if (data) setAnalysts(data)
      })
  }, [])

  const handleCreate = () => {
    setEditingProject(undefined)
    setModalOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const handleSubmit = async (data: Omit<Project, 'id'> & any) => {
    const dbPayload = {
      forecast_start: data.forecast_start !== undefined ? data.forecast_start : null,
      forecast_end: data.forecast_end !== undefined ? data.forecast_end : null,
      impl_start: data.impl_start !== undefined ? data.impl_start : null,
      impl_end: data.impl_end !== undefined ? data.impl_end : null,
      train_start: data.train_start !== undefined ? data.train_start : null,
      train_end: data.train_end !== undefined ? data.train_end : null,
      op_start: data.op_start !== undefined ? data.op_start : null,
      op_end: data.op_end !== undefined ? data.op_end : null,
    }

    if (editingProject) {
      updateProject(editingProject.id, data)
      setTimeout(async () => {
        try {
          await supabase.from('projects').update(dbPayload).eq('id', editingProject.id)
        } catch (e) {
          console.error('Error updating dates:', e)
        }
      }, 1000)
    } else {
      addProject(data as Project)
      setPendingDatesUpdate({ name: data.name, clientId: data.clientId, payload: dbPayload })
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
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início Previsto</TableHead>
              <TableHead>Término Previsto</TableHead>
              <TableHead className="text-right">Horas</TableHead>
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
                const analyst =
                  analysts.find((a) => a.id === project.analystId) ||
                  users.find((u) => u.id === project.analystId)
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
                    <TableCell>{analyst?.nome || analyst?.name || '-'}</TableCell>
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
                      {(project as any).forecastStart || (project as any).forecast_start
                        ? (() => {
                            try {
                              return format(
                                parseISO(
                                  (project as any).forecastStart || (project as any).forecast_start,
                                ),
                                'dd/MM/yyyy',
                              )
                            } catch {
                              return '-'
                            }
                          })()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {(project as any).forecastEnd || (project as any).forecast_end
                        ? (() => {
                            try {
                              return format(
                                parseISO(
                                  (project as any).forecastEnd || (project as any).forecast_end,
                                ),
                                'dd/MM/yyyy',
                              )
                            } catch {
                              return '-'
                            }
                          })()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="font-mono">
                        {hours.toFixed(1)}h
                      </Badge>
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
