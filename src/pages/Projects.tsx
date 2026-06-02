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
import { Plus, Trash2, Edit2, Briefcase, ArrowUp, ArrowDown, Minus, Search } from 'lucide-react'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { ProjectsDashboard } from '@/components/projects/ProjectsDashboard'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { getTaskHours, formatHoursAndMinutes } from '@/lib/time'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProjectChecklists } from '@/hooks/use-project-checklists'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

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

  const { checklists } = useProjectChecklists()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [analystFilter, setAnalystFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredProjects = projects.filter((project) => {
    let match = true

    if (statusFilter !== 'all') {
      match = match && project.statusId === statusFilter
    }
    if (analystFilter !== 'all') {
      match = match && !!project.analystIds?.includes(analystFilter)
    }
    if (clientFilter !== 'all') {
      match = match && project.clientId === clientFilter
    }
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase()
      const projectNameMatch = project.name.toLowerCase().includes(searchLower)
      const client = clients.find((c) => c.id === project.clientId)
      const clientNameMatch = client ? client.name.toLowerCase().includes(searchLower) : false

      match = match && (projectNameMatch || clientNameMatch)
    }

    return match
  })

  const handleCreate = () => {
    setEditingProject(undefined)
    setModalOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (data: Omit<Project, 'id'> & any) => {
    setIsSaving(true)
    try {
      const dbData = {
        name: data.name,
        client_id: data.clientId || null,
        analyst_id: data.analystIds?.[0] || data.analystId || null,
        status_id: data.statusId || null,
        priority: data.priority || 'Média',
        notes: data.notes || null,
        contracted_hours: data.contractedHours || null,
        impl_start: data.implStart || null,
        impl_end: data.implEnd || null,
        train_start: data.trainStart || null,
        train_end: data.trainEnd || null,
        op_start: data.opStart || null,
        op_end: data.opEnd || null,
        forecast_start: data.forecastStart || null,
        forecast_end: data.forecastEnd || null,
      }

      if (editingProject) {
        const { error } = await supabase.from('projects').update(dbData).eq('id', editingProject.id)
        if (error) throw error

        if (data.analystIds && data.analystIds.length > 0) {
          await supabase.from('project_analysts').delete().eq('project_id', editingProject.id)
          const paData = data.analystIds.map((aId: string) => ({
            project_id: editingProject.id,
            analyst_id: aId,
          }))
          await supabase.from('project_analysts').insert(paData)
        } else {
          await supabase.from('project_analysts').delete().eq('project_id', editingProject.id)
        }

        updateProject(editingProject.id, {
          ...data,
          clientId: dbData.client_id,
          statusId: dbData.status_id,
        } as Project)
        toast.success('Projeto atualizado com sucesso!')
      } else {
        const { data: newProject, error } = await supabase
          .from('projects')
          .insert([dbData])
          .select()
          .single()
        if (error) throw error

        if (data.analystIds && data.analystIds.length > 0) {
          const paData = data.analystIds.map((aId: string) => ({
            project_id: newProject.id,
            analyst_id: aId,
          }))
          await supabase.from('project_analysts').insert(paData)
        }

        addProject({
          ...data,
          id: newProject.id,
          clientId: dbData.client_id,
          statusId: dbData.status_id,
        } as Project)
        toast.success('Projeto criado com sucesso!')
      }
      setModalOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao salvar o projeto: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este projeto?')) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) throw error
        deleteProject(id)
        toast.success('Projeto excluído com sucesso!')
      } catch (error: any) {
        console.error(error)
        toast.error('Erro ao excluir o projeto: ' + error.message)
      }
    }
  }

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'Alta':
        return <ArrowUp className="w-4 h-4 text-red-500" />
      case 'Baixa':
        return <ArrowDown className="w-4 h-4 text-blue-500" />
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
            <p className="text-sm text-muted-foreground">Gerencie os projetos de implantação.</p>
          </div>
          <Button onClick={handleCreate} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Novo Projeto
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2">
          <div className="relative flex-1 w-full sm:w-auto sm:min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projeto ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {[...clients]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {projectStatuses.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={analystFilter} onValueChange={setAnalystFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os responsáveis</SelectItem>
              {analysts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nome || a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ProjectsDashboard projects={filteredProjects} />

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Projeto</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Responsáveis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Checklist</TableHead>
              <TableHead>Prazos</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => {
                const client = clients.find((c) => c.id === project.clientId)
                const status = projectStatuses.find((s) => s.id === project.statusId)
                const pTasks = tasks.filter((t) => t.projectId === project.id)
                const hours = pTasks.reduce((acc, t) => acc + getTaskHours(t), 0)

                const projChecklists = checklists.filter((c) => c.project_id === project.id)
                const completedChecklists = projChecklists.filter((c) => c.is_completed).length
                const checklistProgress =
                  projChecklists.length > 0
                    ? (completedChecklists / projChecklists.length) * 100
                    : 0
                const priority = (project as any).priority || 'Média'

                return (
                  <TableRow key={project.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium max-w-[200px] truncate">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="truncate" title={project.name}>
                          {project.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground max-w-[150px] truncate"
                      title={client?.name || '-'}
                    >
                      {client?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {project.analystIds?.length ? (
                          project.analystIds.map((aId) => {
                            const a =
                              analysts.find((an) => an.id === aId) ||
                              users.find((u) => u.id === aId)
                            return a ? (
                              <Badge
                                key={aId}
                                variant="secondary"
                                className="text-xs font-normal truncate max-w-[100px]"
                              >
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
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="text-sm whitespace-nowrap">{status.name}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        {getPriorityIcon(priority)}
                        <span>{priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-[100px]">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{Math.round(checklistProgress)}%</span>
                          <span>
                            {completedChecklists}/{projChecklists.length}
                          </span>
                        </div>
                        <Progress value={checklistProgress} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div>
                          I:{' '}
                          {project.forecastStart
                            ? format(parseISO(project.forecastStart), 'dd/MM/yyyy')
                            : '--/--/----'}
                        </div>
                        <div>
                          T:{' '}
                          {project.forecastEnd
                            ? format(parseISO(project.forecastEnd), 'dd/MM/yyyy')
                            : '--/--/----'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-[80px]">
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
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
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
                      <div className="flex items-center justify-end gap-1">
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
        isSaving={isSaving}
      />
    </div>
  )
}
