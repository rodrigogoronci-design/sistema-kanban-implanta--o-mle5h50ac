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
  Images,
} from 'lucide-react'
import GlobalAttachmentGallery from '@/components/GlobalAttachmentGallery'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import TaskModal from '@/components/TaskModal'
import KanbanCard from '@/components/KanbanCard'
import ArchiveManager from '@/components/ArchiveManager'
import { CategoryManager } from '@/components/CategoryManager'
import { cn } from '@/lib/utils'
import {
  format,
  isSameDay,
  parseISO,
  differenceInDays,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
import {
  MoreVertical,
  Archive,
  Trash2,
  GripHorizontal,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Eye,
  EyeOff,
} from 'lucide-react'

export default function Index() {
  const {
    tasks,
    columns,
    updateTask,
    analysts,
    clients,
    projects,
    categories,
    addTask,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
  } = useMainStore()
  const [view, setView] = useState<'kanban' | 'list' | 'gallery' | 'calendar'>('kanban')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [selectedDayModal, setSelectedDayModal] = useState<{ date: Date; tasks: any[] } | null>(
    null,
  )

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingColumnTitle, setEditingColumnTitle] = useState('')
  const [deleteColId, setDeleteColId] = useState<string | null>(null)
  const [calendarModalOpen, setCalendarModalOpen] = useState(false)

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
  const [showCompleted, setShowCompleted] = useState(true)

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
  const [showCategoryModal, setShowCategoryModal] = useState(false)
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

    if (!newTaskForm.clientId) {
      return
    }

    const backlogColumn = columns.find((c) => c.title.toLowerCase() === 'backlog') || columns[0]

    addTask({
      id: crypto.randomUUID(),
      ...newTaskForm,
      clientId: newTaskForm.clientId,
      projectId: newTaskForm.projectId || undefined,
      categoryId: newTaskForm.categoryId || undefined,
      columnId: backlogColumn ? backlogColumn.id : '',
      description: '',
      checklist: [],
      timeEntries: [],
      createdAt: new Date().toISOString(),
    })

    setNewTaskForm({
      title: '',
      clientId: '',
      projectId: '',
      responsibleId: '',
      priority: 'Média' as any,
      categoryId: '',
    })
    setOpenNewTask(false)
  }

  const visibleColumns = columns.filter((c) => !c.archived)

  const completedColumnIds = columns
    .filter(
      (c) =>
        c.title.toLowerCase().includes('concluíd') || c.title.toLowerCase().includes('concluid'),
    )
    .map((c) => c.id)

  const filteredTasks = tasks.filter((t) => {
    if (search) {
      const q = search.toLowerCase()
      const matchesTask =
        t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
      const matchesAttachment = t.attachments?.some((a) => a.name.toLowerCase().includes(q))
      if (!matchesTask && !matchesAttachment) return false
    }
    if (!showCompleted && t.columnId && completedColumnIds.includes(t.columnId)) return false
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

  const renderCalendar = (isModal = false) => (
    <div
      className={cn(
        'flex flex-col h-full bg-card overflow-hidden',
        !isModal && 'rounded-xl border shadow-sm',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between p-4 border-b shrink-0',
          isModal && 'pr-12',
        )}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCalendarDate(new Date())}>
            Hoje
          </Button>
        </div>
        <h2 className="text-lg font-semibold capitalize hidden sm:block">
          {format(calendarDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold capitalize sm:hidden mr-2">
            {format(calendarDate, 'MMMM', { locale: ptBR })}
          </h2>
          {!isModal && (
            <Button variant="outline" size="sm" onClick={() => setCalendarModalOpen(true)}>
              <Maximize className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:block">Expandir</span>
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto flex flex-col">
        <div className="grid grid-cols-7 border-b bg-muted/50 shrink-0">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {eachDayOfInterval({
            start: startOfWeek(startOfMonth(calendarDate)),
            end: endOfWeek(endOfMonth(calendarDate)),
          }).map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const dayTasks = filteredTasks
              .filter((t) => t.scheduledDate === dateStr)
              .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
            const isCurrentMonth = isSameMonth(day, calendarDate)

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDayModal({ date: day, tasks: dayTasks })}
                className={cn(
                  'border-b border-r p-1 md:p-2 flex flex-col gap-1 min-h-[80px] cursor-pointer hover:bg-muted/50 transition-colors',
                  !isCurrentMonth && 'bg-muted/30 text-muted-foreground',
                  isToday(day) && 'bg-primary/5',
                  isModal ? 'md:min-h-[100px]' : 'md:min-h-[120px]',
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs md:text-sm font-medium w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full',
                      isToday(day) && 'bg-primary text-primary-foreground',
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="md:hidden text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                <div className="hidden md:flex flex-col gap-1 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isModal) setCalendarModalOpen(false)
                        setSelectedTaskId(task.id)
                      }}
                      className="text-xs truncate px-2 py-1 rounded bg-background border shadow-sm cursor-pointer hover:border-primary transition-colors flex items-center gap-1"
                      title={task.title}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            categories.find((c) => c.id === task.categoryId)?.color || '#ccc',
                        }}
                      />
                      {task.scheduledTime && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {task.scheduledTime.substring(0, 5)}
                        </span>
                      )}
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      <style>{`
        .card-vencido > * {
          border-top-width: 4px !important;
          border-top-color: #ef4444 !important;
        }
        .card-a-vencer > * {
          border-top-width: 4px !important;
          border-top-color: #eab308 !important;
        }
        .card-no-prazo > * {
          border-top-width: 4px !important;
          border-top-color: #22c55e !important;
        }
      `}</style>
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
          <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="kanban" title="Kanban">
                <LayoutGrid className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="list" title="Lista">
                <ListIcon className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="calendar" title="Calendário">
                <CalendarIcon className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="gallery" title="Galeria de Anexos">
                <Images className="w-4 h-4" />
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
                        setNewTaskForm((s) => ({
                          ...s,
                          clientId: v,
                          projectId: '',
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
                    <Label>Projeto (Opcional)</Label>
                    <Select
                      value={newTaskForm.projectId}
                      onValueChange={(v) =>
                        setNewTaskForm((s) => ({ ...s, projectId: v === 'none' ? '' : v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {projects
                          .filter(
                            (p) => !newTaskForm.clientId || p.clientId === newTaskForm.clientId,
                          )
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
                        {analysts.map((a) => (
                          <SelectItem key={a.id} value={a.id} disabled={a.status !== 'Ativo'}>
                            {a.nome} {a.status !== 'Ativo' && '(Inativo)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Categoria</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary hover:text-primary/80 hover:bg-transparent"
                        onClick={() => setShowCategoryModal(true)}
                      >
                        Gerenciar
                      </Button>
                    </div>
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

      <div className="flex gap-3 overflow-x-auto pb-2 shrink-0">
        <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col gap-1 min-w-[180px] flex-1">
          <span className="text-xs font-medium text-muted-foreground">Total de Tarefas</span>
          <div className="text-2xl font-bold">{filteredTasks.length}</div>
          <p className="text-[10px] text-muted-foreground">Nos filtros atuais</p>
        </div>
        {visibleColumns.map((col) => {
          const count = filteredTasks.filter((t) => t.columnId === col.id).length
          const percentage =
            filteredTasks.length > 0 ? Math.round((count / filteredTasks.length) * 100) : 0
          return (
            <div
              key={col.id}
              className="bg-card p-4 rounded-lg border shadow-sm flex flex-col gap-1 min-w-[180px] flex-1"
            >
              <span className="text-xs font-medium text-muted-foreground truncate">
                {col.title}
              </span>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground">{percentage}%</div>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                <div
                  className="bg-primary h-1.5 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
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
              <SelectItem value="all">Cliente</SelectItem>
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
              <SelectItem value="all">Projeto</SelectItem>
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
              <SelectItem value="all">Responsável</SelectItem>
              {analysts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Categoria</SelectItem>
              <SelectItem value="none">Sem Categoria</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowCompleted(!showCompleted)}
            className={cn('bg-background', !showCompleted && 'text-muted-foreground')}
          >
            {showCompleted ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showCompleted ? 'Ocultar Concluídos' : 'Mostrar Concluídos'}
          </Button>

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
        {view === 'calendar' ? (
          renderCalendar(false)
        ) : view === 'gallery' ? (
          <GlobalAttachmentGallery
            tasks={filteredTasks}
            searchTerm={search}
            onTaskClick={setSelectedTaskId}
          />
        ) : view === 'kanban' ? (
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
                    .map((task) => {
                      let statusClass = ''
                      if (task.dueDate) {
                        const due = startOfDay(parseISO(task.dueDate))
                        const today = startOfDay(new Date())
                        const diff = differenceInDays(due, today)
                        if (diff < 0) statusClass = 'card-vencido'
                        else if (diff <= 2) statusClass = 'card-a-vencer'
                        else statusClass = 'card-no-prazo'
                      }

                      return (
                        <div key={task.id} className={statusClass}>
                          <KanbanCard
                            task={task}
                            onClick={() => setSelectedTaskId(task.id)}
                            onDragStart={handleDragStart}
                          />
                        </div>
                      )
                    })}
                  {filteredTasks.filter((t) => t.columnId === col.id).length === 0 && (
                    <div className="h-full border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-muted-foreground/50 text-sm text-center p-4">
                      {!showCompleted && completedColumnIds.includes(col.id)
                        ? 'Tarefas concluídas estão ocultas'
                        : 'Arraste cards para cá'}
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
                  <TableHead>Data Agendada</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((t) => {
                  let rowStatusColor = ''
                  if (t.scheduledDate) {
                    const scheduled = startOfDay(parseISO(t.scheduledDate))
                    const today = startOfDay(new Date())
                    const diff = differenceInDays(scheduled, today)
                    if (diff < 0) rowStatusColor = 'bg-red-50/50 dark:bg-red-950/20'
                    else if (diff === 0) rowStatusColor = 'bg-yellow-50/50 dark:bg-yellow-950/20'
                    else rowStatusColor = 'bg-green-50/50 dark:bg-green-950/20'
                  }

                  return (
                    <TableRow
                      key={t.id}
                      className={cn(
                        'cursor-pointer hover:bg-muted/50 transition-colors',
                        rowStatusColor,
                      )}
                      onClick={() => setSelectedTaskId(t.id)}
                    >
                      <TableCell className="font-semibold">{t.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {clients.find((c) => c.id === t.clientId)?.name || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {projects.find((p) => p.id === t.projectId)?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {t.scheduledDate ? format(parseISO(t.scheduledDate), 'dd/MM/yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {t.scheduledTime ? t.scheduledTime.substring(0, 5) : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {columns.find((c) => c.id === t.columnId)?.title || 'Sem Coluna'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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

      <Dialog open={!!selectedDayModal} onOpenChange={(open) => !open && setSelectedDayModal(null)}>
        <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Tarefas -{' '}
              {selectedDayModal?.date
                ? format(selectedDayModal.date, "dd 'de' MMMM, yyyy", { locale: ptBR })
                : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4 overflow-y-auto flex-1 pr-1">
            {selectedDayModal?.tasks.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhuma tarefa agendada para este dia.
              </p>
            ) : (
              selectedDayModal?.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedDayModal(null)
                    setSelectedTaskId(task.id)
                  }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary cursor-pointer transition-colors shadow-sm"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium text-sm truncate">{task.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            categories.find((c) => c.id === task.categoryId)?.color || '#ccc',
                        }}
                      />
                      <span className="truncate">
                        {clients.find((c) => c.id === task.clientId)?.name || 'Sem cliente'}
                      </span>
                    </div>
                  </div>
                  {task.scheduledTime && (
                    <Badge variant="outline" className="shrink-0 ml-2">
                      {task.scheduledTime.substring(0, 5)}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={calendarModalOpen} onOpenChange={setCalendarModalOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Calendário Expandido</DialogTitle>
          </DialogHeader>
          {renderCalendar(true)}
        </DialogContent>
      </Dialog>

      <ArchiveManager open={openArchiveManager} onOpenChange={setOpenArchiveManager} />
      <CategoryManager open={showCategoryModal} onOpenChange={setShowCategoryModal} />

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
