import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import useMainStore, { Project } from '@/stores/main'
import { ProjectTasksTab } from './ProjectTasksTab'
import { ProjectGalleryTab } from './ProjectGalleryTab'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  onSubmit: (data: Omit<Project, 'id'> & any) => void
}

export function ProjectFormModal({ open, onOpenChange, project, onSubmit }: Props) {
  const { clients, users, projectStatuses } = useMainStore()
  const [formData, setFormData] = useState<Partial<Project> & any>({})
  const [clientOpen, setClientOpen] = useState(false)

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({ ...project })
      } else {
        setFormData({
          name: '',
          clientId: '',
          analystId: '',
          statusId: '',
        })
      }
    }
  }, [open, project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData as any)
  }

  const renderFormFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="col-span-1 md:col-span-2 space-y-2">
        <Label>Nome do Projeto *</Label>
        <Input
          required
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Implantação ERP"
        />
      </div>

      <div className="space-y-2 flex flex-col">
        <Label>Cliente Vinculado</Label>
        <Popover open={clientOpen} onOpenChange={setClientOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={clientOpen}
              className="w-full justify-between font-normal"
            >
              {formData.clientId
                ? clients.find((c) => c.id === formData.clientId)?.name
                : 'Selecione ou pesquise um cliente...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Pesquisar cliente..." />
              <CommandList>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                <CommandGroup>
                  {clients.map((client) => (
                    <CommandItem
                      key={client.id}
                      value={client.name}
                      onSelect={() => {
                        setFormData({ ...formData, clientId: client.id })
                        setClientOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          formData.clientId === client.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      {client.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Responsável</Label>
        <Select
          value={formData.analystId || ''}
          onValueChange={(v) => setFormData({ ...formData, analystId: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um responsável" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u: any) => (
              <SelectItem key={u.id} value={u.id}>
                {u.nome || u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={formData.statusId || ''}
          onValueChange={(v) => setFormData({ ...formData, statusId: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {projectStatuses.map((s: any) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="col-span-1 md:col-span-2 pt-4 border-t mt-2">
        <h4 className="text-sm font-semibold mb-4">Prazos e Datas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Início Previsto</Label>
            <Input
              type="date"
              value={
                formData.forecast_start?.split('T')[0] ||
                formData.forecastStart?.split('T')[0] ||
                ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  forecast_start: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Término Previsto</Label>
            <Input
              type="date"
              value={
                formData.forecast_end?.split('T')[0] || formData.forecastEnd?.split('T')[0] || ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  forecast_end: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Início Implantação</Label>
            <Input
              type="date"
              value={formData.impl_start?.split('T')[0] || formData.implStart?.split('T')[0] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  impl_start: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Término Implantação</Label>
            <Input
              type="date"
              value={formData.impl_end?.split('T')[0] || formData.implEnd?.split('T')[0] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  impl_end: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Início Treinamento</Label>
            <Input
              type="date"
              value={
                formData.train_start?.split('T')[0] || formData.trainStart?.split('T')[0] || ''
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  train_start: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Término Treinamento</Label>
            <Input
              type="date"
              value={formData.train_end?.split('T')[0] || formData.trainEnd?.split('T')[0] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  train_end: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Início Operação</Label>
            <Input
              type="date"
              value={formData.op_start?.split('T')[0] || formData.opStart?.split('T')[0] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  op_start: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Término Operação</Label>
            <Input
              type="date"
              value={formData.op_end?.split('T')[0] || formData.opEnd?.split('T')[0] || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  op_end: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>{project ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        </DialogHeader>

        {project ? (
          <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="tasks">Atividades</TabsTrigger>
                <TabsTrigger value="gallery">Galeria</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="details"
              className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none"
            >
              <form id="project-form" onSubmit={handleSubmit}>
                {renderFormFields()}
              </form>
            </TabsContent>

            <TabsContent
              value="tasks"
              className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none"
            >
              <ProjectTasksTab project={project as Project} />
            </TabsContent>

            <TabsContent
              value="gallery"
              className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none"
            >
              <ProjectGalleryTab project={project as Project} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <form id="project-form" onSubmit={handleSubmit}>
              {renderFormFields()}
            </form>
          </div>
        )}

        <div className="p-6 pt-4 border-t bg-background flex justify-end gap-2 shrink-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="project-form">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
