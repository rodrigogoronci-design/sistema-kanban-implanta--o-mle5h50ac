import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
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
import { ListTodo, Search, LayoutGrid, List as ListIcon, Calendar, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import {
  fetchAtividades,
  fetchUserAnalystId,
  AtividadeWithRelations,
} from '@/services/minhas-atividades'
import { updateAtividade, deleteAtividade, ProjetoAtividade } from '@/services/projetos-implantacao'
import { KanbanView } from '@/components/minhas-atividades/KanbanView'
import { ListView } from '@/components/minhas-atividades/ListView'
import { CalendarView } from '@/components/minhas-atividades/CalendarView'
import { AtividadeDetailModal } from '@/components/jornadas/AtividadeDetailModal'

type ViewType = 'kanban' | 'list' | 'calendar'
const VIEW_KEY = 'minhas-atividades-view'

export default function MinhasAtividades() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<AtividadeWithRelations[]>([])
  const [analysts, setAnalysts] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewType>(
    () => (localStorage.getItem(VIEW_KEY) as ViewType) || 'kanban',
  )
  const [search, setSearch] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [selected, setSelected] = useState<AtividadeWithRelations | null>(null)
  const [responsibleFilter, setResponsibleFilter] = useState<string | 'all'>('all')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    fetchUserAnalystId(user.id)
      .then((id) => {
        setResponsibleFilter(id || 'all')
      })
      .catch(() => setResponsibleFilter('all'))
      .finally(() => setReady(true))
  }, [user?.id])

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    try {
      const [data, aRes] = await Promise.all([
        fetchAtividades(responsibleFilter === 'all' ? null : responsibleFilter),
        supabase.from('analistas').select('id, nome').eq('status', 'Ativo').order('nome'),
      ])
      setActivities(data)
      setAnalysts(aRes.data || [])
    } catch (e: any) {
      toast.error('Erro ao carregar atividades: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [user?.id, responsibleFilter])

  useEffect(() => {
    if (!ready) return
    loadData()
  }, [ready, loadData])

  const handleViewChange = (v: ViewType) => {
    setView(v)
    localStorage.setItem(VIEW_KEY, v)
  }

  const clients = useMemo(() => {
    const m = new Map<string, string>()
    activities.forEach((a) => {
      if (a.client_id && a.client_name) m.set(a.client_id, a.client_name)
    })
    return Array.from(m.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [activities])

  const projects = useMemo(() => {
    const m = new Map<string, string>()
    activities.forEach((a) => {
      if (a.project_id && a.projeto_name) m.set(a.project_id, a.projeto_name)
    })
    return Array.from(m.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [activities])

  const filtered = useMemo(
    () =>
      activities.filter((a) => {
        if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
        if (clientFilter !== 'all' && a.client_id !== clientFilter) return false
        if (projectFilter !== 'all' && a.project_id !== projectFilter) return false
        return true
      }),
    [activities, search, clientFilter, projectFilter],
  )

  const handleUpdate = async (id: string, data: Partial<ProjetoAtividade>) => {
    await updateAtividade(id, data)
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)))
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, ...data } : null))
  }

  const handleKanbanDrop = async (id: string, targetStatus: string) => {
    const original = activities.find((a) => a.id === id)
    if (!original) return

    if (
      original.status === targetStatus &&
      (targetStatus !== 'Concluído' || original.is_completed)
    ) {
      return
    }

    const updates: Partial<ProjetoAtividade> = { status: targetStatus }

    if (targetStatus === 'Concluído') {
      updates.is_completed = true
      updates.status = 'Concluído'
      if (!original.realization_date) {
        updates.realization_date = new Date().toISOString().split('T')[0]
      }
    } else {
      updates.is_completed = false
    }

    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))

    try {
      await updateAtividade(id, updates)
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, ...updates } : null))
      }
    } catch (e: any) {
      setActivities((prev) => prev.map((a) => (a.id === id ? original : a)))
      toast.error(
        'Erro ao mover atividade: ' + e.message + '. A atividade voltou à coluna original.',
      )
    }
  }

  const handleDelete = async (id: string) => {
    await deleteAtividade(id)
    setActivities((prev) => prev.filter((a) => a.id !== id))
    setSelected(null)
  }

  const views = [
    { id: 'kanban' as const, label: 'Kanban', icon: LayoutGrid },
    { id: 'list' as const, label: 'Lista', icon: ListIcon },
    { id: 'calendar' as const, label: 'Calendário', icon: Calendar },
  ]

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-primary" /> Minhas Atividades
          </h1>
          <p className="text-sm text-muted-foreground">
            Centralize e gerencie suas atividades de implantação.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium whitespace-nowrap">Responsável</Label>
          <Select
            value={responsibleFilter}
            onValueChange={(v) => setResponsibleFilter(v as string | 'all')}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Selecione um responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os analistas</SelectItem>
              {analysts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1 border rounded-lg p-1 w-fit">
        {views.map((v) => (
          <Button
            key={v.id}
            variant={view === v.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleViewChange(v.id)}
          >
            <v.icon className="w-4 h-4 mr-1" /> {v.label}
          </Button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atividade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={clientFilter} onValueChange={setClientFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Cliente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os projetos</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <p>Nenhuma atividade encontrada com os filtros atuais.</p>
        </div>
      ) : view === 'kanban' ? (
        <KanbanView activities={filtered} onSelect={setSelected} onDrop={handleKanbanDrop} />
      ) : view === 'list' ? (
        <ListView activities={filtered} onSelect={setSelected} />
      ) : (
        <CalendarView activities={filtered} onSelect={setSelected} />
      )}

      <AtividadeDetailModal
        atividade={selected}
        analysts={analysts}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  )
}
