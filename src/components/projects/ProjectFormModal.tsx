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
import { Check, ChevronsUpDown, Settings } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import useMainStore, { Project } from '@/stores/main'
import { toast } from 'sonner'
import { StatusManagementModal } from './StatusManagementModal'
import { ProjectTasksTab } from './ProjectTasksTab'
import { ProjectGalleryTab } from './ProjectGalleryTab'
import { ProjectChecklistTab } from './ProjectChecklistTab'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project
  onSubmit: (data: Omit<Project, 'id'> & any) => void
  isSaving?: boolean
}

export function ProjectFormModal({ open, onOpenChange, project, onSubmit, isSaving }: Props) {
  const { clients, analysts, projectStatuses } = useMainStore()
  const [formData, setFormData] = useState<
    Partial<Project> & {
      priority?: string
      notes?: string
      generates_commission?: boolean
      commission_status?: string
    }
  >({})
  const [clientOpen, setClientOpen] = useState(false)
  const [analystsOpen, setAnalystsOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)

  useEffect(() => {
    if (open) {
      if (project) {
        setFormData({
          ...project,
          priority: (project as any).priority || 'Média',
          notes: (project as any).notes || '',
          generates_commission: (project as any).generates_commission || false,
          commission_status: (project as any).commission_status || 'Pendente',
        })
      } else {
        setFormData({
          name: '',
          clientId: '',
          analystIds: [],
          statusId: '',
          priority: 'Média',
          notes: '',
          generates_commission: false,
          commission_status: 'Pendente',
        })
      }
    }
  }, [open, project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      toast.error('O nome do projeto é obrigatório.')
      return
    }
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
        <Label>Empresa Vinculada</Label>
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
                : 'Selecione ou pesquise uma empresa...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Pesquisar empresa..." />
              <CommandList>
                <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                <CommandGroup>
                  {[...clients]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((client) => (
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

      <div className="space-y-2 flex flex-col">
        <Label>Responsáveis</Label>
        <Popover open={analystsOpen} onOpenChange={setAnalystsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={analystsOpen}
              className="w-full justify-between font-normal"
            >
              {formData.analystIds?.length
                ? `${formData.analystIds.length} selecionado(s)`
                : 'Selecione responsáveis...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Pesquisar analista..." />
              <CommandList>
                <CommandEmpty>Nenhum analista encontrado.</CommandEmpty>
                <CommandGroup>
                  {(analysts || []).map((a: any) => {
                    const isSelected = formData.analystIds?.includes(a.id)
                    return (
                      <CommandItem
                        key={a.id}
                        value={a.nome || a.name}
                        onSelect={() => {
                          const current = formData.analystIds || []
                          setFormData({
                            ...formData,
                            analystIds: isSelected
                              ? current.filter((id: string) => id !== a.id)
                              : [...current, a.id],
                          })
                        }}
                      >
                        <Checkbox checked={isSelected} className="mr-2 pointer-events-none" />
                        {a.nome || a.name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Status</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsStatusModalOpen(true)}
            title="Gerenciar Status"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
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

      <div className="space-y-2">
        <Label>Prioridade</Label>
        <Select
          value={formData.priority || 'Média'}
          onValueChange={(v) => setFormData({ ...formData, priority: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Baixa">Baixa</SelectItem>
            <SelectItem value="Média">Média</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Horas Contratadas</Label>
        <Input
          type="number"
          min="0"
          value={formData.contractedHours ?? ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              contractedHours: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          placeholder="Ex: 100"
        />
      </div>

      <div className="col-span-1 md:col-span-2 space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Anotações internas do projeto..."
          className="min-h-[80px] resize-none"
        />
      </div>

      <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-4 border rounded-md bg-muted/20">
        <div className="space-y-3 flex flex-col justify-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="generates_commission"
              checked={formData.generates_commission || false}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, generates_commission: checked === true })
              }
            />
            <Label htmlFor="generates_commission" className="font-medium cursor-pointer">
              Gera Comissão?
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Marque se este projeto gera comissão para o analista responsável.
          </p>
        </div>

        {formData.generates_commission && (
          <div className="space-y-2">
            <Label>Status da Comissão</Label>
            <Select
              value={formData.commission_status || 'Pendente'}
              onValueChange={(v) => setFormData({ ...formData, commission_status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="col-span-1 md:col-span-2 pt-4 border-t mt-2">
        <h4 className="text-sm font-semibold mb-4">Prazos e Datas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Início Previsto</Label>
            <Input
              type="date"
              value={formData.forecastStart ? formData.forecastStart.substring(0, 10) : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  forecastStart: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Término Previsto</Label>
            <Input
              type="date"
              value={formData.forecastEnd ? formData.forecastEnd.substring(0, 10) : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  forecastEnd: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Início Implantação</Label>
            <Input
              type="date"
              value={formData.implStart ? formData.implStart.substring(0, 10) : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  implStart: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Término Implantação</Label>
            <Input
              type="date"
              value={formData.implEnd ? formData.implEnd.substring(0, 10) : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  implEnd: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Início Treinamento</Label>
            <Input
              type="date"
              value={formData.trainStart ? formData.trainStart.substring(0, 10) : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  trainStart: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Término Treinamento</Label>
            <Input
              type="date"
              value={formData.trainEnd ? formData.trainEnd.substring(0, 10) : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  trainEnd: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Início Operação</Label>
            <Input
              type="date"
              value={formData.opStart ? formData.opStart.substring(0, 10) : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  opStart: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Término Operação</Label>
            <Input
              type="date"
              value={formData.opEnd ? formData.opEnd.substring(0, 10) : ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  opEnd: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col p-0 gap-0">
          <form
            id="project-form"
            onSubmit={handleSubmit}
            className="flex flex-col h-full overflow-hidden"
          >
            <DialogHeader className="p-6 pb-4 border-b">
              <DialogTitle>{project ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
            </DialogHeader>

            {project ? (
              <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
                <div className="px-6 pt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="tasks">Atividades</TabsTrigger>
                    <TabsTrigger value="checklist">Checklist</TabsTrigger>
                    <TabsTrigger value="gallery">Galeria</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="details"
                  className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none"
                >
                  {renderFormFields()}
                </TabsContent>

                <TabsContent
                  value="tasks"
                  className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none"
                >
                  <ProjectTasksTab project={project as Project} />
                </TabsContent>

                <TabsContent
                  value="checklist"
                  className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none"
                >
                  <ProjectChecklistTab project={project as Project} />
                </TabsContent>

                <TabsContent
                  value="gallery"
                  className="flex-1 overflow-y-auto p-6 m-0 focus-visible:outline-none"
                >
                  <ProjectGalleryTab project={project as Project} />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex-1 overflow-y-auto p-6">{renderFormFields()}</div>
            )}

            <div className="p-6 pt-4 border-t bg-background flex justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" form="project-form" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <StatusManagementModal open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen} />
    </>
  )
}
