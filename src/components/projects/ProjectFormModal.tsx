import { useState, useEffect } from 'react'
import useMainStore, { Project } from '@/stores/main'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const toDateInput = (iso?: string) => (iso ? iso.split('T')[0] : '')
const toIso = (dateStr?: string) => (dateStr ? new Date(dateStr).toISOString() : undefined)

export function ProjectFormModal({
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
  const { clients, users, projectStatuses } = useMainStore()
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    name: '',
    clientId: '',
    analystId: '',
    statusId: '',
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
          statusId: project.statusId,
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
          statusId: projectStatuses[0]?.id || '',
          implStart: '',
          implEnd: '',
          trainStart: '',
          trainEnd: '',
          opStart: '',
          opEnd: '',
        })
      }
    }
  }, [open, project, projectStatuses])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.clientId || !formData.statusId) return

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
              <Label>Status Atual</Label>
              <Select value={formData.statusId} onValueChange={(v) => updateField('statusId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status..." />
                </SelectTrigger>
                <SelectContent>
                  {projectStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.name}
                      </div>
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
