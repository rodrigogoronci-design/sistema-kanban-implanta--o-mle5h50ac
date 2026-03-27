import { useState, useEffect } from 'react'
import useMainStore, { Project, ProjectPhase } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

const PHASES: ProjectPhase[] = [
  'Configuração do Sistema',
  'Em treinamento',
  'Operação Assistida',
  'Concluído',
]

const toDateInput = (iso?: string) => (iso ? iso.split('T')[0] : '')
const toIso = (dateStr?: string) => (dateStr ? new Date(dateStr).toISOString() : undefined)

function ProjectFormModal({
  open,
  onOpenChange,
  project,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  onSubmit: (data: Omit<Project, 'id'>) => void
}) {
  const { clients, users } = useMainStore()
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    clientId: '',
    analystId: '',
    phase: 'Configuração do Sistema',
    implStart: '',
    implEnd: '',
    trainStart: '',
    trainEnd: '',
    opStart: '',
    opEnd: '',
  })

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({
          name: project.name,
          clientId: project.clientId,
          analystId: project.analystId,
          phase: project.phase,
          implStart: toDateInput(project.implStart),
          implEnd: toDateInput(project.implEnd),
          trainStart: toDateInput(project.trainStart),
          trainEnd: toDateInput(project.trainEnd),
          opStart: toDateInput(project.opStart),
          opEnd: toDateInput(project.opEnd),
        })
      } else {
        setFormData({
          name: '',
          clientId: '',
          analystId: '',
          phase: 'Configuração do Sistema',
          implStart: '',
          implEnd: '',
          trainStart: '',
          trainEnd: '',
          opStart: '',
          opEnd: '',
        })
      }
    }
  }, [open, project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.clientId || !formData.phase) return

    onSubmit({
      ...formData,
      implStart: toIso(formData.implStart),
      implEnd: toIso(formData.implEnd),
      trainStart: toIso(formData.trainStart),
      trainEnd: toIso(formData.trainEnd),
      opStart: toIso(formData.opStart),
      opEnd: toIso(formData.opEnd),
    })
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((s) => ({ ...s, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{project ? 'Editar Projeto' : 'Criar Novo Projeto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente Vinculado</Label>
              <Select value={formData.clientId} onValueChange={(v) => updateField('clientId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Analista Responsável</Label>
              <Select value={formData.analystId} onValueChange={(v) => updateField('analystId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Fase Atual</Label>
              <Select value={formData.phase} onValueChange={(v) => updateField('phase', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a fase..." />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4 mt-4 space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Datas do Cronograma</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Início Implantação</Label>
                <Input
                  type="date"
                  value={formData.implStart}
                  onChange={(e) => updateField('implStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Fim Implantação</Label>
                <Input
                  type="date"
                  value={formData.implEnd}
                  onChange={(e) => updateField('implEnd', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Início Treinamento</Label>
                <Input
                  type="date"
                  value={formData.trainStart}
                  onChange={(e) => updateField('trainStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Fim Treinamento</Label>
                <Input
                  type="date"
                  value={formData.trainEnd}
                  onChange={(e) => updateField('trainEnd', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Início Op. Assistida</Label>
                <Input
                  type="date"
                  value={formData.opStart}
                  onChange={(e) => updateField('opStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Fim Op. Assistida</Label>
                <Input
                  type="date"
                  value={formData.opEnd}
                  onChange={(e) => updateField('opEnd', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4">
            {project ? 'Salvar Alterações' : 'Salvar Projeto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const PhaseBadge = ({ phase }: { phase: ProjectPhase }) => {
  switch (phase) {
    case 'Configuração do Sistema':
      return <Badge variant="secondary">{phase}</Badge>
    case 'Em treinamento':
      return (
        <Badge
          variant="outline"
          className="text-amber-600 border-amber-600/30 bg-amber-50/50 dark:bg-amber-500/10"
        >
          {phase}
        </Badge>
      )
    case 'Operação Assistida':
      return (
        <Badge
          variant="outline"
          className="text-blue-600 border-blue-600/30 bg-blue-50/50 dark:bg-blue-500/10"
        >
          {phase}
        </Badge>
      )
    case 'Concluído':
      return (
        <Badge
          variant="outline"
          className="text-emerald-600 border-emerald-600/30 bg-emerald-50/50 dark:bg-emerald-500/10"
        >
          {phase}
        </Badge>
      )
    default:
      return <Badge>{phase}</Badge>
  }
}

export default function Projects() {
  const { projects, clients, users, addProject, updateProject, deleteProject } = useMainStore()
  const { toast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Projetos</h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe o ciclo de vida e responsáveis pelos projetos de implantação.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Projeto
        </Button>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Nome do Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Fase Atual</TableHead>
              <TableHead>Início (Impl.)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((proj) => {
              const client = clients.find((c) => c.id === proj.clientId)
              const user = users.find((u) => u.id === proj.analystId)
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
                    <PhaseBadge phase={proj.phase} />
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {formatDate(proj.implStart)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
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
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
