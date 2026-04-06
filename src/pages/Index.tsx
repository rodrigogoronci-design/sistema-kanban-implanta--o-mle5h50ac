import { useState } from 'react'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  List as ListIcon,
  LayoutGrid,
  Search,
  Calendar as CalendarIcon,
  X,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import TaskModal from '@/components/TaskModal'
import KanbanCard from '@/components/KanbanCard'
import ArchiveManager from '@/components/ArchiveManager'
import { cn } from '@/lib/utils'
import { format, isSameDay, parseISO } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { MoreVertical, Archive, Trash2, GripHorizontal } from 'lucide-react'
import { BarChart, Bar, XAxis, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function Index() {
  const {
    tasks,
    columns,
    updateTask,
    users,
    clients,
    projects,
    categories,
    addTask,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
  } = useMainStore()
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingColumnTitle, setEditingColumnTitle] = useState('')
  const [deleteColId, setDeleteColId] = useState<string | null>(null)

  const handleEditColumnStart = (col: { id: string; title: string }) => {
    setEditingColumnId(col.id)
    setEditingColumnTitle(col.title)
  }

  const handleEditColumnSave = () => {
    if (editingColumnId && editingColumnTitle.trim()) {
      updateColumn(editingColumnId, { title: editingColumnTitle.trim() })
    }
    setEditingColumnId(null)
  }

  const handleAddColumn = () => {
    const newId = `col-${Math.random().toString(36).substr(2, 9)}`
    addColumn({ id: newId, title: 'Nova Coluna' })
    setEditingColumnId(newId)
    setEditingColumnTitle('Nova Coluna')
  }

  const [search, setSearch] = useState('')
  const [filterUser, setFilterUser] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [filterProject, setFilterProject] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDueDate, setFilterDueDate] = useState<Date | undefined>()

  const clearFilters = () => {
    setSearch('')
    setFilterUser('all')
    setFilterClient('all')
    setFilterProject('all')
    setFilterCategory('all')
    setFilterDueDate(undefined)
  }

  const [openNewTask, setOpenNewTask] = useState(false)
  const [openArchiveManager, setOpenArchiveManager] = useState(false)
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    clientId: '',
    projectId: '',
    responsibleId: '',
    priority: 'Média' as any,
    categoryId: '',
  })

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.stopPropagation()
    e.dataTransfer.setData('type', 'task')
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleColumnDragStart = (e: React.DragEvent, colId: string) => {
    e.stopPropagation()
    e.dataTransfer.setData('type', 'column')
    e.dataTransfer.setData('colId', colId)
  }

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const type = e.dataTransfer.getData('type')

    if (type === 'column') {
      const sourceColId = e.dataTransfer.getData('colId')
      if (sourceColId && sourceColId !== targetColId) {
        const sourceIdx = columns.findIndex((c) => c.id === sourceColId)
        const targetIdx = columns.findIndex((c) => c.id === targetColId)
        if (sourceIdx !== -1 && targetIdx !== -1) {
          reorderColumns(sourceIdx, targetIdx)
        }
      }
    } else {
      const taskId = e.dataTransfer.getData('taskId')
      if (taskId) updateTask(taskId, { columnId: targetColId })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    addTask({
      id: Math.random().toString(),
      ...newTaskForm,
      categoryId: newTaskForm.categoryId || undefined,
      columnId: 'backlog',
      description: '',
      checklist: [],
      timeEntries: [],
      createdAt: new Date().toISOString(),
    })
    setOpenNewTask(false)
  }

  const visibleColumns = columns.filter((c) => !c.archived)

  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase()
      if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q))
        return false
    }
    if (filterUser !== 'all' && t.responsibleId !== filterUser) return false
    if (filterClient !== 'all' && t.clientId !== filterClient) return false
    if (filterProject !== 'all' && t.projectId !== filterProject) return false
    if (filterCategory !== 'all') {
      if (filterCategory === 'none' && t.categoryId) return false
      if (filterCategory !== 'none' && t.categoryId !== filterCategory) return false
    }
    if (filterDueDate) {
      if (!t.dueDate) return false
      if (!isSameDay(parseISO(t.dueDate), filterDueDate)) return false
    }
    return true
  })

  const hasActiveFilters =
    search ||
    filterUser !== 'all' ||
    filterClient !== 'all' ||
    filterProject !== 'all' ||
    filterCategory !== 'all' ||
    filterDueDate

  const chartData = categories.map((cat) => ({
    name: cat.name,
    count: tasks.filter((t) => t.categoryId === cat.id).length,
    fill: cat.color,
  }))
  const uncategorizedCount = tasks.filter((t) => !t.categoryId).length
  if (uncategorizedCount > 0) {
    chartData.push({ name: 'Sem Categoria', count: uncategorizedCount, fill: '#cbd5e1' })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Área de Trabalho</h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="shadow-sm"
            onClick={() => setOpenArchiveManager(true)}
          >
            <Archive className="w-4 h-4 mr-2" /> Colunas Arquivadas
          </Button>
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
                    <Select
                      value={newTaskForm.categoryId}
                      onValueChange={(v) => setNewTaskForm((s) => ({ ...s, categoryId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: c.color }}
                              />
                              {c.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

      <div className="bg-card p-4 rounded-lg border shadow-sm shrink-0 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Volume de Tarefas por Categoria
        </h2>
        <ChartContainer
          config={{ count: { label: 'Tarefas' } }}
          className="h-[100px] w-full aspect-auto"
        >
          <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      <div className="flex flex-col gap-3 bg-card p-4 rounded-lg border shadow-sm shrink-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou descrição..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            value={filterClient}
            onValueChange={(val) => {
              setFilterClient(val)
              if (val !== 'all') {
                const clientProjs = projects.filter((p) => p.clientId === val)
                if (filterProject !== 'all' && !clientProjs.find((p) => p.id === filterProject)) {
                  setFilterProject('all')
                }
              }
            }}
          >
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {projects
                .filter((p) => filterClient === 'all' || p.clientId === filterClient)
                .map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Responsáveis</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              <SelectItem value="none">Sem Categoria</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[160px] justify-start text-left font-normal bg-background',
                  !filterDueDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDueDate ? format(filterDueDate, 'dd/MM/yyyy') : <span>Vencimento</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDueDate}
                onSelect={setFilterDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground shrink-0"
              title="Limpar Filtros"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 h-full items-start">
            {visibleColumns.map((col) => (
              <div
                key={col.id}
                draggable
                onDragStart={(e) => handleColumnDragStart(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                onDragOver={handleDragOver}
                className="flex flex-col bg-muted/60 rounded-xl p-3 w-80 shrink-0 max-h-full border shadow-sm cursor-grab active:cursor-grabbing"
              >
                <div className="flex items-center justify-between mb-3 px-1 gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <GripHorizontal className="w-4 h-4 text-muted-foreground shrink-0 cursor-grab" />
                    {editingColumnId === col.id ? (
                      <Input
                        autoFocus
                        value={editingColumnTitle}
                        onChange={(e) => setEditingColumnTitle(e.target.value)}
                        onBlur={handleEditColumnSave}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditColumnSave()
                          if (e.key === 'Escape') setEditingColumnId(null)
                        }}
                        className="h-8 text-sm font-bold flex-1"
                      />
                    ) : (
                      <h3
                        className="font-bold text-sm truncate flex-1 cursor-pointer hover:bg-muted/80 p-1 rounded -ml-1 transition-colors"
                        onClick={() => handleEditColumnStart(col)}
                        title="Clique para editar"
                      >
                        {col.title}
                      </h3>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="secondary" className="bg-background text-foreground shadow-sm">
                      {filteredTasks.filter((t) => t.columnId === col.id).length}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updateColumn(col.id, { archived: true })}>
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteColId(col.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
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
            <Button
              variant="outline"
              className="w-80 h-[100px] shrink-0 border-dashed border-2 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              onClick={handleAddColumn}
            >
              <Plus className="w-5 h-5" />
              Adicionar Coluna
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-auto h-full shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Título</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell className="text-muted-foreground">
                      {projects.find((p) => p.id === t.projectId)?.name}
                    </TableCell>
                    <TableCell>
                      {t.dueDate ? format(parseISO(t.dueDate), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {columns.find((c) => c.id === t.columnId)?.title || 'Sem Coluna'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma tarefa encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedTaskId && (
        <TaskModal taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}

      <ArchiveManager open={openArchiveManager} onOpenChange={setOpenArchiveManager} />

      <AlertDialog open={!!deleteColId} onOpenChange={(open) => !open && setDeleteColId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Coluna?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta coluna permanentemente? As tarefas nela ficarão
              sem coluna visível. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteColId) {
                  deleteColumn(deleteColId)
                  setDeleteColId(null)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
