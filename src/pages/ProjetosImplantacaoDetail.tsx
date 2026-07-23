import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  Clock,
  Paperclip,
  User,
  Calendar as CalendarIcon,
  Trash2,
  Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import {
  fetchProjetoDetails,
  updateAtividade,
  updateProjeto,
  addExtraAtividade,
  addAtividadeToProject,
  deleteAtividade,
  addEtapaToProject,
  deleteEtapaFromProject,
  checkAndUpdateProgression,
  ProjetoWithDetails,
  ProjetoAtividade,
} from '@/services/projetos-implantacao'
import { AtividadeDetailModal } from '@/components/jornadas/AtividadeDetailModal'
import {
  fetchTimeEntriesByProject,
  calculateDurationHours,
  formatDuration,
} from '@/services/projeto-atividade-time-entries'

export default function ProjetosImplantacaoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [projeto, setProjeto] = useState<ProjetoWithDetails | null>(null)
  const [client, setClient] = useState<{ name: string } | null>(null)
  const [analysts, setAnalysts] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAtividade, setSelectedAtividade] = useState<ProjetoAtividade | null>(null)
  const [newExtraName, setNewExtraName] = useState<Record<string, string>>({})
  const [openAccordions, setOpenAccordions] = useState<string[]>([])
  const [newEtapaName, setNewEtapaName] = useState('')
  const [addingEtapa, setAddingEtapa] = useState(false)
  const [projectTotalHours, setProjectTotalHours] = useState(0)
  const [activityHours, setActivityHours] = useState<Record<string, number>>({})

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const [p, aRes] = await Promise.all([
        fetchProjetoDetails(id),
        supabase.from('analistas').select('id, nome').eq('status', 'Ativo').order('nome'),
      ])
      setProjeto(p)
      setAnalysts(aRes.data || [])

      if (p?.client_id) {
        const { data: cData } = await supabase
          .from('clients')
          .select('name')
          .eq('id', p.client_id)
          .single()
        setClient(cData || null)
      }

      if (p?.etapas?.length) {
        const currentIdx = p.etapas.findIndex((e) => e.id === p.current_step_id)
        const defaultOpen = currentIdx >= 0 ? [p.etapas[currentIdx].id] : [p.etapas[0].id]
        setOpenAccordions(defaultOpen)
      }

      try {
        const timeEntries = await fetchTimeEntriesByProject(id)
        const total = timeEntries.reduce(
          (sum, e) => sum + calculateDurationHours(e.start_time, e.end_time),
          0,
        )
        setProjectTotalHours(total)

        const perActivity: Record<string, number> = {}
        for (const e of timeEntries) {
          const dur = calculateDurationHours(e.start_time, e.end_time)
          perActivity[e.projeto_atividade_id] = (perActivity[e.projeto_atividade_id] || 0) + dur
        }
        setActivityHours(perActivity)
      } catch {
        setProjectTotalHours(0)
        setActivityHours({})
      }
    } catch (e: any) {
      toast.error('Erro ao carregar projeto: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdate = async (atividadeId: string, data: Partial<ProjetoAtividade>) => {
    if (!projeto) return

    const enrichedData = { ...data }

    if ('realization_date' in enrichedData) {
      const dateValue = enrichedData.realization_date
      if (!dateValue || dateValue === '') {
        enrichedData.status = 'Em Andamento'
        enrichedData.is_completed = false
      } else {
        enrichedData.status = 'Concluído'
        enrichedData.is_completed = true
      }
    }

    const updatedAtividades = (projeto.atividades ?? []).map((a) =>
      a.id === atividadeId ? { ...a, ...enrichedData } : a,
    )
    setProjeto((prev) => (prev ? { ...prev, atividades: updatedAtividades } : null))

    if (selectedAtividade?.id === atividadeId) {
      setSelectedAtividade({ ...selectedAtividade, ...enrichedData })
    }

    try {
      await updateAtividade(atividadeId, enrichedData)
      await checkAndUpdateProgression(id!, projeto.etapas, updatedAtividades)
      await loadData()
    } catch (e: any) {
      toast.error('Erro ao atualizar: ' + e.message)
    }
  }

  const handleAddExtra = async (etapaId: string) => {
    const name = newExtraName[etapaId]?.trim()
    if (!name) return
    try {
      await addExtraAtividade(id!, etapaId, name)
      setNewExtraName((prev) => ({ ...prev, [etapaId]: '' }))
      toast.success('Atividade extra adicionada!')
      await loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  const handleDelete = async (atividadeId: string) => {
    try {
      await deleteAtividade(atividadeId)
      toast.success('Atividade removida!')
      await loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  const handleAddEtapa = async () => {
    const name = newEtapaName.trim()
    if (!name || !id) return
    setAddingEtapa(true)
    try {
      const position = projeto?.etapas?.length || 0
      const etapa = await addEtapaToProject(id, name, position)
      if (!projeto?.current_step_id) {
        await updateProjeto(id, { current_step_id: etapa.id })
      }
      setNewEtapaName('')
      toast.success('Etapa criada!')
      await loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    } finally {
      setAddingEtapa(false)
    }
  }

  const handleDeleteEtapa = async (etapaId: string) => {
    try {
      await deleteEtapaFromProject(etapaId)
      toast.success('Etapa removida!')
      await loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  const handleAddAtividade = async (etapaId: string) => {
    const name = newExtraName[etapaId]?.trim()
    if (!name) return
    try {
      await addAtividadeToProject(id!, etapaId, name)
      setNewExtraName((prev) => ({ ...prev, [etapaId]: '' }))
      toast.success('Atividade adicionada!')
      await loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  if (loading || !projeto) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const etapas = projeto.etapas ?? []
  const atividades = projeto.atividades ?? []
  const total = atividades.length
  const completed = atividades.filter((a) => a.is_completed).length
  const progress = total > 0 ? (completed / total) * 100 : 0
  const currentStepIdx = etapas.findIndex((e) => e.id === projeto.current_step_id)
  const analystName = analysts.find((a) => a.id === projeto.analyst_id)?.nome

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/projetos-implantacao')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link to="/projetos-implantacao" className="hover:text-foreground transition-colors">
              Projetos de Implantação
            </Link>
            <span>/</span>
            <span className="text-foreground">{projeto.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{projeto.name}</h1>
          {client && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Building2 className="w-3.5 h-3.5" /> {client.name}
            </div>
          )}
          {(analystName || projeto.data_demanda) && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
              {analystName && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {analystName}
                </span>
              )}
              {projeto.data_demanda && (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {new Date(projeto.data_demanda + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          )}
        </div>
        <Badge
          variant={projeto.status === 'Concluído' ? 'default' : 'secondary'}
          className={cn(
            'font-normal',
            projeto.status === 'Concluído' && 'bg-emerald-500/10 text-emerald-600',
          )}
        >
          {projeto.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Progresso Geral</span>
            <span className="text-sm font-bold">
              {completed} / {total} atividades ({Math.round(progress)}%)
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Geral de Horas do Projeto
              </span>
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tight">
            {formatDuration(projectTotalHours)}
          </div>
        </Card>
      </div>

      {etapas.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {etapas.map((etapa, idx) => {
            const isCurrent = etapa.id === projeto.current_step_id
            const etAtvs = atividades.filter((a) => a.etapa_id === etapa.id)
            const etDone = etAtvs.length > 0 && etAtvs.every((a) => a.is_completed)
            const isPast = currentStepIdx > idx || projeto.status === 'Concluído'
            const showCompleted = etDone || (etAtvs.length === 0 && isPast)
            return (
              <div key={etapa.id} className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    showCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : isCurrent
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {showCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  )}
                  {etapa.name}
                </div>
                {idx < etapas.length - 1 && <div className="w-4 h-px bg-border" />}
              </div>
            )
          })}
        </div>
      )}

      <Accordion type="multiple" value={openAccordions} onValueChange={setOpenAccordions}>
        {etapas.map((etapa) => {
          const etAtvs = atividades.filter((a) => a.etapa_id === etapa.id)
          const isCurrent = etapa.id === projeto.current_step_id
          const etCompleted = etAtvs.filter((a) => a.is_completed).length
          const etProgress = etAtvs.length > 0 ? (etCompleted / etAtvs.length) * 100 : 0

          return (
            <AccordionItem
              key={etapa.id}
              value={etapa.id}
              className={cn(
                'rounded-xl border px-4 mb-3 bg-card',
                isCurrent && 'border-primary/30 bg-primary/5',
              )}
            >
              <div className="flex items-center gap-2">
                <AccordionTrigger className="hover:no-underline py-4 flex-1">
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <div
                      className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0',
                        etProgress === 100
                          ? 'bg-emerald-100 text-emerald-700'
                          : isCurrent
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {etProgress === 100 ? <CheckCircle2 className="w-4 h-4" /> : etCompleted}
                    </div>
                    <span className="font-semibold text-sm">{etapa.name}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {etCompleted}/{etAtvs.length}
                    </Badge>
                    {isCurrent && <Badge className="text-xs">Etapa Atual</Badge>}
                  </div>
                </AccordionTrigger>
                {!projeto.jornada_id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleDeleteEtapa(etapa.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <AccordionContent>
                <div className="space-y-2 pt-2 pb-4">
                  {etAtvs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma atividade nesta etapa.
                    </p>
                  )}
                  {etAtvs.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => setSelectedAtividade(a)}
                      className={cn(
                        'rounded-lg border p-3 cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-all flex items-center gap-3',
                        a.is_completed && 'bg-emerald-50/50 border-emerald-200',
                      )}
                    >
                      <div className="shrink-0">
                        {a.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm font-medium truncate',
                              a.is_completed && 'line-through text-muted-foreground',
                            )}
                          >
                            {a.name}
                          </span>
                          {a.is_extra && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-purple-100 text-purple-700 shrink-0"
                            >
                              Extra
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                          {a.responsible_id && (
                            <span>
                              {analysts.find((an) => an.id === a.responsible_id)?.nome || '-'}
                            </span>
                          )}
                          {a.forecast_date && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(a.forecast_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {activityHours[a.id] > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Timer className="w-3 h-3" />
                              {formatDuration(activityHours[a.id])}
                            </span>
                          )}
                          {a.rat_url && (
                            <span className="flex items-center gap-0.5">
                              <Paperclip className="w-3 h-3" /> RAT
                            </span>
                          )}
                          {a.status !== 'A Fazer' && a.status !== 'Concluído' && (
                            <Badge variant="outline" className="text-xs">
                              {a.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs shrink-0',
                          a.status === 'Concluído' &&
                            'bg-emerald-50 text-emerald-600 border-emerald-200',
                        )}
                      >
                        {a.status}
                      </Badge>
                    </div>
                  ))}
                  <div className="flex gap-2 pt-1">
                    <Input
                      value={newExtraName[etapa.id] || ''}
                      onChange={(e) =>
                        setNewExtraName((prev) => ({ ...prev, [etapa.id]: e.target.value }))
                      }
                      placeholder={
                        projeto.jornada_id ? 'Nome da atividade extra...' : 'Nome da atividade...'
                      }
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (projeto.jornada_id) {
                            handleAddExtra(etapa.id)
                          } else {
                            handleAddAtividade(etapa.id)
                          }
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        projeto.jornada_id ? handleAddExtra(etapa.id) : handleAddAtividade(etapa.id)
                      }
                      disabled={!newExtraName[etapa.id]?.trim()}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      {projeto.jornada_id ? 'Extra' : 'Adicionar'}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {!projeto.jornada_id && (
        <Card className="p-4 border-dashed">
          <div className="flex items-center gap-2">
            <Input
              value={newEtapaName}
              onChange={(e) => setNewEtapaName(e.target.value)}
              placeholder="Nome da nova etapa..."
              className="h-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddEtapa()
                }
              }}
            />
            <Button
              onClick={handleAddEtapa}
              disabled={!newEtapaName.trim() || addingEtapa}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              {addingEtapa ? 'Criando...' : 'Adicionar Etapa'}
            </Button>
          </div>
          {etapas.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              Nenhuma etapa criada. Adicione a primeira etapa para começar.
            </p>
          )}
        </Card>
      )}

      <AtividadeDetailModal
        atividade={selectedAtividade}
        analysts={analysts}
        onClose={() => setSelectedAtividade(null)}
        onUpdate={handleUpdate}
        onDelete={selectedAtividade?.is_extra ? handleDelete : undefined}
      />
    </div>
  )
}
