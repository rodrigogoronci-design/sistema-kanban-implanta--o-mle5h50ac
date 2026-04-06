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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'

export default function TaskModal({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { tasks, updateTask, users, clients, projects, categories, addCategory } = useMainStore()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
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
                  <Select value={task.clientId} onValueChange={handleClientChange}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
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
                  <Label className="text-muted-foreground">Projeto</Label>
                  <Select
                    value={task.projectId}
                    onValueChange={(val: any) => updateTask(task.id, { projectId: val })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {projects
                        .filter((p) => p.clientId === task.clientId)
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
                          !task.category && 'text-muted-foreground',
                        )}
                      >
                        {task.category || 'Ex: Treinamento'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Buscar categoria..."
                          value={categorySearch}
                          onValueChange={setCategorySearch}
                        />
                        <CommandList>
                          <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                          <CommandGroup>
                            {categories.map((cat) => (
                              <CommandItem
                                key={cat}
                                value={cat}
                                onSelect={() => {
                                  updateTask(task.id, { category: cat })
                                  setCategoryOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    task.category === cat ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                {cat}
                              </CommandItem>
                            ))}
                            {categorySearch &&
                              !categories.some(
                                (c) => c.toLowerCase() === categorySearch.toLowerCase(),
                              ) && (
                                <CommandItem
                                  value={categorySearch}
                                  onSelect={() => {
                                    addCategory(categorySearch)
                                    updateTask(task.id, { category: categorySearch })
                                    setCategorySearch('')
                                    setCategoryOpen(false)
                                  }}
                                >
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Criar "{categorySearch}"
                                </CommandItem>
                              )}
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

              <div className="space-y-2">
                <Label className="text-muted-foreground">Responsável</Label>
                <Select
                  value={task.responsibleId}
                  onValueChange={(val: any) => updateTask(task.id, { responsibleId: val })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
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
            <TaskActivities task={task} onUpdate={onUpdate} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
