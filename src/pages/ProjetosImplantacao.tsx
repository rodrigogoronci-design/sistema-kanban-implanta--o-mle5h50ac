import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Building2,
  User,
  Search,
  LayoutGrid,
  List,
  Pencil,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ProjetoFormModal } from '@/components/projetos-implantacao/ProjetoFormModal'
import { ProjetoListView } from '@/components/projetos-implantacao/ProjetoListView'
import { fetchProjetos, deleteProjeto, ProjetoImplantacao } from '@/services/projetos-implantacao'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'

type ViewMode = 'cards' | 'list'

const VIEW_STORAGE_KEY = 'projetos-implantacao-view'

function getStoredView(): ViewMode {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY)
    return stored === 'list' ? 'list' : 'cards'
  } catch {
    return 'cards'
  }
}

export default function ProjetosImplantacao() {
  const [projetos, setProjetos] = useState<ProjetoImplantacao[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewClientOnly, setShowNewClientOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<ProjetoImplantacao | null>(null)
  const [view, setView] = useState<ViewMode>('cards')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [projectStatuses, setProjectStatuses] = useState<
    { id: string; name: string; color: string; position?: number | null }[]
  >([])
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    setView(getStoredView())
  }, [])

  const handleViewChange = (value: ViewMode) => {
    setView(value)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, value)
    } catch {
      // ignore storage errors
    }
  }

  const loadProjetos = useCallback(async () => {
    try {
      setLoading(true)
      const [data, { data: statuses }] = await Promise.all([
        fetchProjetos(showNewClientOnly ? { isNewClient: true } : undefined),
        supabase
          .from('project_statuses')
          .select('id, name, color, position')
          .order('position' as any, { ascending: true, nullsFirst: false }),
      ])
      setProjetos(data)
      setProjectStatuses(
        (statuses || []).sort((a: any, b: any) => (a.position ?? 999) - (b.position ?? 999)),
      )
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar projetos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [showNewClientOnly])

  useEffect(() => {
    loadProjetos()
  }, [loadProjetos])

  const filteredProjetos = projetos.filter((p) => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && p.status_id !== statusFilter) return false
    return true
  })

  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="container mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold">Projetos de Implantação</h1>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-md border bg-muted/40 p-0.5">
            <button
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                view === 'cards'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => handleViewChange('cards')}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
                view === 'list'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => handleViewChange('list')}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
          <Button
            onClick={() => {
              setEditingProjeto(null)
              setModalOpen(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={showNewClientOnly}
            onCheckedChange={setShowNewClientOnly}
            id="filter-new-client"
          />
          <Label htmlFor="filter-new-client" className="cursor-pointer whitespace-nowrap text-sm">
            Novo Cliente
          </Label>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <div className="overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <TabsList className="w-max inline-flex justify-start h-10 items-center bg-muted p-1 rounded-md">
            <TabsTrigger value="all" className="gap-2 px-4">
              Todos
              <Badge variant="secondary" className="px-1.5 py-0.5 text-xs bg-background">
                {projetos.length}
              </Badge>
            </TabsTrigger>
            {projectStatuses.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className="gap-2 px-4">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                {s.name}
                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs bg-background">
                  {projetos.filter((p) => p.status_id === s.id).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando projetos...</div>
      ) : filteredProjetos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum projeto encontrado.</div>
      ) : view === 'cards' ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjetos.map((projeto) => {
            const isExpanded = expandedCards.has(projeto.id)
            const clientName = projeto.client?.name
            const analystName = projeto.analyst?.nome
            const hasExtraInfo = projeto.forecast_start || projeto.forecast_end || projeto.notes
            return (
              <Link key={projeto.id} to={`/projetos-implantacao/${projeto.id}`}>
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                  <CardHeader className="p-3 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold leading-tight truncate">
                            {projeto.name}
                          </span>
                          {projeto.is_new_client && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                              Novo Cliente
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {projeto.data_demanda
                            ? new Date(projeto.data_demanda).toLocaleDateString('pt-BR')
                            : '—'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setEditingProjeto(projeto)
                          setModalOpen(true)
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-1.5">
                    {clientName && (
                      <div className="text-xs text-muted-foreground truncate">{clientName}</div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {projeto.statusInfo && (
                          <div
                            className="w-2 h-2 rounded-full mr-1 shrink-0"
                            style={{ backgroundColor: projeto.statusInfo.color }}
                          />
                        )}
                        {projeto.statusInfo?.name || projeto.status}
                      </Badge>
                      {analystName && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {analystName}
                        </span>
                      )}
                    </div>
                    {hasExtraInfo && (
                      <Collapsible open={isExpanded} onOpenChange={() => {}}>
                        <CollapsibleTrigger asChild>
                          <button
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mt-1"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleCardExpansion(projeto.id)
                            }}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                            {isExpanded ? 'Ver menos' : 'Ver mais'}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                          {projeto.forecast_start && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Previsão Início: {formatDate(projeto.forecast_start)}</span>
                            </div>
                          )}
                          {projeto.forecast_end && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Previsão Fim: {formatDate(projeto.forecast_end)}</span>
                            </div>
                          )}
                          {projeto.notes && (
                            <p className="text-xs italic truncate" title={projeto.notes}>
                              {projeto.notes}
                            </p>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <ProjetoListView
          projetos={filteredProjetos}
          projectStatuses={projectStatuses}
          statusFilter={statusFilter}
          onEdit={(p) => {
            setEditingProjeto(p)
            setModalOpen(true)
          }}
          onDelete={async (p) => {
            try {
              await deleteProjeto(p.id)
              setProjetos((prev) => prev.filter((proj) => proj.id !== p.id))
              toast({ title: 'Sucesso', description: 'Projeto excluído com sucesso' })
            } catch (e: any) {
              toast({
                title: 'Erro',
                description: 'Erro ao excluir projeto. Tente novamente.',
                variant: 'destructive',
              })
            }
          }}
        />
      )}

      <ProjetoFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projeto={editingProjeto}
        onSaved={loadProjetos}
      />
    </div>
  )
}
