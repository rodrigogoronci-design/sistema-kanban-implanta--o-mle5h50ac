import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { getTaskHours } from '@/lib/time'
import { Badge } from '@/components/ui/badge'
import { StatusManagementModal } from './StatusManagementModal'

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
  const { clients, projectStatuses, tasks } = useMainStore()
  const [analysts, setAnalysts] = useState<any[]>([])
  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => {
    supabase
      .from('analistas')
      .select('id, nome, status')
      .order('nome')
      .then(({ data }) => {
        if (data) setAnalysts(data)
      })
  }, [])
  const [formData, setFormData] = useState<
    Omit<Project, 'id'> & { forecastStart?: string; forecastEnd?: string }
  >({
    name: '',
    clientId: '',
    analystId: '',
    statusId: '',
    forecastStart: '',
    forecastEnd: '',
    implStart: '',
    implEnd: '',
    trainStart: '',
    trainEnd: '',
    opStart: '',
    opEnd: '',
  })

  const projectTasks = project ? tasks.filter((t) => t.projectId === project.id) : []
  const totalHours = projectTasks.reduce((acc, t) => acc + getTaskHours(t), 0)

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({
          name: project.name,
          clientId: project.clientId,
          analystId: project.analystId,
          statusId: project.statusId,
          forecastStart: toDateInput(
            (project as any).forecastStart || (project as any).forecast_start,
          ),
          forecastEnd: toDateInput((project as any).forecastEnd || (project as any).forecast_end),
          implStart: toDateInput((project as any).implStart || (project as any).impl_start),
          implEnd: toDateInput((project as any).implEnd || (project as any).impl_end),
          trainStart: toDateInput((project as any).trainStart || (project as any).train_start),
          trainEnd: toDateInput((project as any).trainEnd || (project as any).train_end),
          opStart: toDateInput((project as any).opStart || (project as any).op_start),
          opEnd: toDateInput((project as any).opEnd || (project as any).op_end),
        })
      } else {
        setFormData({
          name: '',
          clientId: '',
          analystId: '',
          statusId: projectStatuses[0]?.id || '',
          forecastStart: '',
          forecastEnd: '',
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
      forecastStart: toIso(formData.forecastStart),
      forecastEnd: toIso(formData.forecastEnd),
      forecast_start: toIso(formData.forecastStart),
      forecast_end: toIso(formData.forecastEnd),
      implStart: toIso(formData.implStart),
      implEnd: toIso(formData.implEnd),
      impl_start: toIso(formData.implStart),
      impl_end: toIso(formData.implEnd),
      trainStart: toIso(formData.trainStart),
      trainEnd: toIso(formData.trainEnd),
      train_start: toIso(formData.trainStart),
      train_end: toIso(formData.trainEnd),
      opStart: toIso(formData.opStart),
      opEnd: toIso(formData.opEnd),
      op_start: toIso(formData.opStart),
      op_end: toIso(formData.opEnd),
    } as any)
  }

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((s) => ({ ...s, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start justify-between pr-8">
            <DialogTitle>{project ? 'Editar Projeto' : 'Criar Novo Projeto'}</DialogTitle>
            {project && (
              <Badge variant="secondary" className="font-mono text-xs">
                Total de Horas: {totalHours.toFixed(1)}h
              </Badge>
            )}
          </div>
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
                  {analysts.map((a) => (
                    <SelectItem key={a.id} value={a.id} disabled={a.status !== 'Ativo'}>
                      {a.nome} {a.status !== 'Ativo' && '(Inativo)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <Label>Status Atual</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:text-primary/80 hover:bg-transparent"
                  onClick={() => setShowStatusModal(true)}
                >
                  Gerenciar Status
                </Button>
              </div>
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
                <Label className="text-xs">Previsão Início</Label>
                <Input
                  type="date"
                  value={formData.forecastStart}
                  onChange={(e) => updateField('forecastStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Previsão Fim</Label>
                <Input
                  type="date"
                  value={formData.forecastEnd}
                  onChange={(e) => updateField('forecastEnd', e.target.value)}
                />
              </div>
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
      {showStatusModal && (
        <StatusManagementModal open={showStatusModal} onOpenChange={setShowStatusModal} />
      )}
    </Dialog>
  )
}
