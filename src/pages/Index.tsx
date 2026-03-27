import { useState } from 'react'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, List as ListIcon, LayoutGrid, Search } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import TaskDrawer from '@/components/TaskDrawer'
import KanbanCard from '@/components/KanbanCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function Index() {
  const { tasks, columns, updateTask, users, clients, projects, addTask } = useMainStore()
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState('all')

  const [openNewTask, setOpenNewTask] = useState(false)
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    clientId: '',
    projectId: '',
    responsibleId: '',
    priority: 'Média' as any,
    category: 'Implantação',
  })

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) updateTask(taskId, { columnId })
  }

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    addTask({
      id: Math.random().toString(),
      ...newTaskForm,
      columnId: 'backlog',
      description: '',
      checklist: [],
      timeEntries: [],
    })
    setOpenNewTask(false)
  }

  const filteredTasks = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterUser !== 'all' && t.responsibleId !== filterUser) return false
    return true
  })

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar card..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Responsáveis</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-[120px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="kanban">
                <LayoutGrid className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <ListIcon className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Dialog open={openNewTask} onOpenChange={setOpenNewTask}>
            <DialogTrigger asChild>
              <Button className="shadow-sm">
                <Plus className="w-4 h-4 mr-2" /> Novo Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label>Título da Tarefa</Label>
                  <Input
                    required
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm((s) => ({ ...s, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Select
                      required
                      value={newTaskForm.clientId}
                      onValueChange={(v) => {
                        const clientProjects = projects.filter((p) => p.clientId === v)
                        setNewTaskForm((s) => ({
                          ...s,
                          clientId: v,
                          projectId: clientProjects.length > 0 ? clientProjects[0].id : '',
                        }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
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
                    <Label>Projeto</Label>
                    <Select
                      required
                      value={newTaskForm.projectId}
                      onValueChange={(v) => setNewTaskForm((s) => ({ ...s, projectId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projects
                          .filter((p) => p.clientId === newTaskForm.clientId)
                          .map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Responsável</Label>
                    <Select
                      required
                      value={newTaskForm.responsibleId}
                      onValueChange={(v) => setNewTaskForm((s) => ({ ...s, responsibleId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input
                      required
                      value={newTaskForm.category}
                      onChange={(e) => setNewTaskForm((s) => ({ ...s, category: e.target.value }))}
                      list="new-categories"
                    />
                    <datalist id="new-categories">
                      <option value="Consultoria" />
                      <option value="Infraestrutura" />
                      <option value="Treinamento" />
                      <option value="Implantação" />
                      <option value="Suporte" />
                    </datalist>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Adicionar Tarefa
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 h-full items-start">
            {columns.map((col) => (
              <div
                key={col.id}
                className="flex flex-col bg-muted/60 rounded-xl p-3 w-80 shrink-0 max-h-full border shadow-sm"
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
              >
                <h3 className="font-bold text-sm mb-3 flex items-center justify-between text-foreground px-1">
                  {col.title}
                  <Badge variant="secondary" className="bg-background text-foreground shadow-sm">
                    {filteredTasks.filter((t) => t.columnId === col.id).length}
                  </Badge>
                </h3>
                <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-[150px] p-1">
                  {filteredTasks
                    .filter((t) => t.columnId === col.id)
                    .map((task) => (
                      <KanbanCard
                        key={task.id}
                        task={task}
                        onClick={() => setSelectedTaskId(task.id)}
                        onDragStart={handleDragStart}
                      />
                    ))}
                  {filteredTasks.filter((t) => t.columnId === col.id).length === 0 && (
                    <div className="h-full border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-muted-foreground/50 text-sm">
                      Arraste cards para cá
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-auto h-full shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((t) => (
                  <TableRow
                    key={t.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedTaskId(t.id)}
                  >
                    <TableCell className="font-semibold">{t.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {clients.find((c) => c.id === t.clientId)?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{t.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {columns.find((c) => c.id === t.columnId)?.title}
                      </Badge>
                    </TableCell>
                    <TableCell>{users.find((u) => u.id === t.responsibleId)?.name}</TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma tarefa encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedTaskId && (
        <TaskDrawer taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
    </div>
  )
}
