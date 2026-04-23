import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import useMainStore from '@/stores/main'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { TaskChecklist } from './TaskChecklist'
import { TaskActivities } from './TaskActivities'
import { TaskAttachments } from './TaskAttachments'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Check, ChevronsUpDown, Settings, Edit2, Trash2, X, Plus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { CategoryManager } from './CategoryManager'
import { ClientFormModal } from './ClientFormModal'

export default function TaskModal({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const {
    tasks,
    updateTask,
    clients,
    projects,
    categories,
    analysts,
    addClient,
    updateClient,
    deleteClient,
  } = useMainStore()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState('')
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [editingClientName, setEditingClientName] = useState('')
  const [clientFormOpen, setClientFormOpen] = useState(false)
  const [analystsOpen, setAnalystsOpen] = useState(false)

  const task = tasks.find((t) => t.id === taskId)

  if (!task) return null

  const handleClientChange = (val: string) => {
    const clientProjects = projects.filter((p) => p.clientId === val)
    updateTask(task.id, {
      clientId: val,
      projectId: clientProjects.length > 0 ? clientProjects[0].id : '',
    })
  }

  const onUpdate = (payload: Partial<typeof task>) => updateTask(task.id, payload)

  return (
    <>
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-2xl w-full p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-6 pb-4 bg-muted/20 border-b shrink-0">
            <DialogHeader>
              <DialogTitle className="text-xl text-primary">
                <Input
                  value={task.title}
                  onChange={(e) => updateTask(task.id, { title: e.target.value })}
                  className="text-lg font-bold h-auto py-1 px-2 -ml-2 bg-transparent border-transparent hover:border-input focus-visible:bg-background"
                  placeholder="Título da tarefa"
                />
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col gap-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Cliente</Label>
                    <Popover open={clientOpen} onOpenChange={setClientOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={clientOpen}
                          className={cn(
                            'w-full justify-between bg-background font-normal',
                            !task.clientId && 'text-muted-foreground',
                          )}
                        >
                          <span className="truncate">
                            {task.clientId
                              ? clients.find((c) => c.id === task.clientId)?.name ||
                                'Cliente não encontrado'
                              : 'Selecione um cliente...'}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Buscar cliente..."
                            value={clientSearch}
                            onValueChange={setClientSearch}
                          />
                          <CommandList>
                            <CommandEmpty className="py-4 px-2 text-center text-sm">
                              <p className="text-muted-foreground mb-2">
                                Nenhum cliente encontrado.
                              </p>
                              {clientSearch && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() => {
                                    setClientFormOpen(true)
                                    setClientOpen(false)
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Criar "{clientSearch}"
                                </Button>
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  setClientSearch('')
                                  setClientFormOpen(true)
                                  setClientOpen(false)
                                }}
                                className="font-medium text-primary cursor-pointer"
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar novo cliente
                              </CommandItem>
                            </CommandGroup>
                            <CommandGroup>
                              {clients.map((c) => (
                                <CommandItem
                                  key={c.id}
                                  value={c.name}
                                  onSelect={() => {
                                    if (editingClientId) return
                                    handleClientChange(c.id)
                                    setClientOpen(false)
                                  }}
                                  className="group flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                                    <Check
                                      className={cn(
                                        'h-4 w-4 shrink-0',
                                        task.clientId === c.id ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {editingClientId === c.id ? (
                                      <Input
                                        value={editingClientName}
                                        onChange={(e) => setEditingClientName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            if (editingClientName.trim()) {
                                              updateClient(c.id, { name: editingClientName.trim() })
                                            }
                                            setEditingClientId(null)
                                            e.stopPropagation()
                                          }
                                          if (e.key === 'Escape') {
                                            setEditingClientId(null)
                                            e.stopPropagation()
                                          }
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-7 py-1 px-2 text-sm"
                                        autoFocus
                                      />
                                    ) : (
                                      <span className="truncate">{c.name}</span>
                                    )}
                                  </div>

                                  {!editingClientId && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEditingClientId(c.id)
                                          setEditingClientName(c.name)
                                        }}
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (
                                            confirm(
                                              `Tem certeza que deseja excluir o cliente ${c.name}? Isso pode afetar tarefas e projetos associados.`,
                                            )
                                          ) {
                                            deleteClient(c.id)
                                            if (task.clientId === c.id) {
                                              updateTask(task.id, { clientId: '', projectId: '' })
                                            }
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                  {editingClientId === c.id && (
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-100/50"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (editingClientName.trim()) {
                                            updateClient(c.id, { name: editingClientName.trim() })
                                          }
                                          setEditingClientId(null)
                                        }}
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setEditingClientId(null)
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            {clients.length > 0 &&
                              clientSearch &&
                              !clients.some(
                                (c) => c.name.toLowerCase() === clientSearch.toLowerCase(),
                              ) && (
                                <CommandGroup>
                                  <CommandItem
                                    value={clientSearch}
                                    onSelect={() => {
                                      setClientFormOpen(true)
                                      setClientOpen(false)
                                    }}
                                    className="text-primary font-medium cursor-pointer"
                                  >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar "{clientSearch}"
                                  </CommandItem>
                                </CommandGroup>
                              )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Projeto</Label>
                    <Select
                      value={task.projectId || 'none'}
                      onValueChange={(val: any) =>
                        updateTask(task.id, { projectId: val === 'none' ? '' : val })
                      }
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Nenhum projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" className="text-muted-foreground italic">
                          Nenhum projeto
                        </SelectItem>
                        {projects
                          .filter((p) => !task.clientId || p.clientId === task.clientId)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Categoria</Label>
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={categoryOpen}
                          className={cn(
                            'w-full justify-between bg-background font-normal',
                            !task.categoryId && 'text-muted-foreground',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {task.categoryId && categories.find((c) => c.id === task.categoryId) ? (
                              <>
                                <div
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{
                                    backgroundColor: categories.find(
                                      (c) => c.id === task.categoryId,
                                    )?.color,
                                  }}
                                />
                                <span className="truncate">
                                  {categories.find((c) => c.id === task.categoryId)?.name}
                                </span>
                              </>
                            ) : (
                              'Selecione...'
                            )}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                      >
                        <Command>
                          <CommandInput placeholder="Buscar categoria..." />
                          <CommandList>
                            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((cat) => (
                                <CommandItem
                                  key={cat.id}
                                  value={cat.name}
                                  onSelect={() => {
                                    updateTask(task.id, { categoryId: cat.id })
                                    setCategoryOpen(false)
                                  }}
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <div
                                      className="w-3 h-3 rounded-full shrink-0"
                                      style={{ backgroundColor: cat.color }}
                                    />
                                    <span className="flex-1 truncate">{cat.name}</span>
                                    <Check
                                      className={cn(
                                        'h-4 w-4 shrink-0',
                                        task.categoryId === cat.id ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <Separator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  setCategoryOpen(false)
                                  setCategoryManagerOpen(true)
                                }}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Gerenciar Categorias
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Prioridade</Label>
                    <Select
                      value={task.priority}
                      onValueChange={(val: any) => updateTask(task.id, { priority: val })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Média">Média</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Data de Criação</Label>
                    <Input
                      readOnly
                      value={task.createdAt ? format(parseISO(task.createdAt), 'dd/MM/yyyy') : '-'}
                      className="bg-muted text-muted-foreground pointer-events-none"
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <Label className="text-muted-foreground">Data de Vencimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal bg-background',
                            !task.dueDate && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {task.dueDate ? (
                            format(parseISO(task.dueDate), 'dd/MM/yyyy')
                          ) : (
                            <span>Selecione...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={task.dueDate ? parseISO(task.dueDate) : undefined}
                          onSelect={(date) => updateTask(task.id, { dueDate: date?.toISOString() })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 flex flex-col justify-end">
                    <Label className="text-muted-foreground">Data Agendada</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full justify-start text-left font-normal bg-background',
                            !task.scheduledDate && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {task.scheduledDate ? (
                            format(parseISO(task.scheduledDate), 'dd/MM/yyyy')
                          ) : (
                            <span>Selecione...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={task.scheduledDate ? parseISO(task.scheduledDate) : undefined}
                          onSelect={(date) =>
                            updateTask(task.id, {
                              scheduledDate: date ? format(date, 'yyyy-MM-dd') : undefined,
                            })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <Label className="text-muted-foreground">Horário Agendado</Label>
                    <Input
                      type="time"
                      value={task.scheduledTime?.slice(0, 5) || ''}
                      onChange={(e) => updateTask(task.id, { scheduledTime: e.target.value })}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label className="text-muted-foreground">Responsáveis</Label>
                  <Popover open={analystsOpen} onOpenChange={setAnalystsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={analystsOpen}
                        className="w-full justify-between bg-background font-normal"
                      >
                        {task.responsibleIds?.length
                          ? `${task.responsibleIds.length} selecionado(s)`
                          : 'Nenhum responsável'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Pesquisar analista..." />
                        <CommandList>
                          <CommandEmpty>Nenhum analista encontrado.</CommandEmpty>
                          <CommandGroup>
                            {analysts.map((a) => {
                              const isSelected = task.responsibleIds?.includes(a.id)
                              return (
                                <CommandItem
                                  key={a.id}
                                  value={a.nome}
                                  onSelect={() => {
                                    const current = task.responsibleIds || []
                                    updateTask(task.id, {
                                      responsibleIds: isSelected
                                        ? current.filter((id) => id !== a.id)
                                        : [...current, a.id],
                                    })
                                  }}
                                  disabled={a.status !== 'Ativo'}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    className="mr-2 pointer-events-none"
                                  />
                                  {a.nome} {a.status !== 'Ativo' && '(Inativo)'}
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
                  <Label className="text-muted-foreground">Descrição</Label>
                  <Textarea
                    value={task.description}
                    onChange={(e) => updateTask(task.id, { description: e.target.value })}
                    rows={4}
                    className="resize-none bg-background"
                    placeholder="Adicione detalhes sobre a tarefa..."
                  />
                </div>
              </div>

              <Separator />
              <TaskChecklist task={task} onUpdate={onUpdate} />
              <Separator />
              <TaskAttachments task={task} onUpdate={onUpdate} />
              <Separator />
              <TaskActivities task={task} onUpdate={onUpdate} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CategoryManager open={categoryManagerOpen} onOpenChange={setCategoryManagerOpen} />
      <ClientFormModal
        open={clientFormOpen}
        onOpenChange={setClientFormOpen}
        client={
          clientSearch
            ? ({ id: '', name: clientSearch, cnpj: '', contacts: [], modules: [], logo: '' } as any)
            : undefined
        }
        onSubmit={(data) => {
          const newId = `client-${Math.random().toString(36).substr(2, 9)}`
          addClient({ id: newId, ...data })
          handleClientChange(newId)
          setClientFormOpen(false)
          setClientSearch('')
        }}
      />
    </>
  )
}
