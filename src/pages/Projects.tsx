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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Trash2, Pencil, Settings2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'

import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { StatusManagementModal } from '@/components/projects/StatusManagementModal'
import { ProjectsDashboard } from '@/components/projects/ProjectsDashboard'

export default function Projects() {
  const { projects, clients, users, projectStatuses, addProject, updateProject, deleteProject } =
    useMainStore()
  const { toast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  const handleFormSubmit = (data: Omit<Project, 'id'>) => {
    if (editingProject) {
      updateProject(editingProject.id, data)
      toast({ title: 'Sucesso', description: 'Projeto atualizado com sucesso!' })
    } else {
      addProject({
        id: Math.random().toString(),
        ...data,
      })
      toast({ title: 'Sucesso', description: 'Projeto criado com sucesso!' })
    }
    setFormOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete)
      toast({ title: 'Sucesso', description: 'Projeto removido.' })
    }
    setProjectToDelete(null)
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-'
    return format(new Date(isoString), 'dd/MM/yyyy', { locale: ptBR })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Projetos</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Gerencie o ciclo de vida, status e responsáveis dos projetos de implantação.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setStatusModalOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" /> Gerenciar Status
          </Button>
          <Button
            onClick={() => {
              setEditingProject(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Projeto
          </Button>
        </div>
      </div>

      <ProjectsDashboard />

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Nome do Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Início (Impl.)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((proj) => {
              const client = clients.find((c) => c.id === proj.clientId)
              const user = users.find((u) => u.id === proj.analystId)
              const status = projectStatuses.find((s) => s.id === proj.statusId)

              return (
                <TableRow key={proj.id} className="group">
                  <TableCell className="font-semibold">{proj.name}</TableCell>
                  <TableCell>
                    {client ? (
                      <Badge variant="secondary">{client.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user?.name || '-'}</TableCell>
                  <TableCell>
                    <Select
                      value={proj.statusId}
                      onValueChange={(v) => updateProject(proj.id, { statusId: v })}
                    >
                      <SelectTrigger className="h-8 min-w-[160px] border-dashed bg-background/50 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2 truncate">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: status?.color || '#ccc' }}
                          />
                          <span className="truncate">{status?.name || 'Sem status'}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {projectStatuses.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: s.color }}
                              />
                              {s.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {formatDate(proj.implStart)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => {
                          setEditingProject(proj)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setProjectToDelete(proj.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum projeto cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        project={editingProject}
        onSubmit={handleFormSubmit}
      />
      <StatusManagementModal open={statusModalOpen} onOpenChange={setStatusModalOpen} />

      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O projeto será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
