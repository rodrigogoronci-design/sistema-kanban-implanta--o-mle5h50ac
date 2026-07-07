import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import {
  fetchProjetoDetails,
  updateAtividade,
  addExtraAtividade,
  deleteAtividade,
  checkAndUpdateProgression,
  ProjetoWithDetails,
  ProjetoAtividade,
} from '@/services/projetos-implantacao'
import { AtividadeCard } from './AtividadeCard'

interface Props {
  projectId: string
  onClose: () => void
}

export function ProjetoDetailModal({ projectId, onClose }: Props) {
  const [projeto, setProjeto] = useState<ProjetoWithDetails | null>(null)
  const [analysts, setAnalysts] = useState<{ id: string; nome: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [newExtraName, setNewExtraName] = useState<Record<string, string>>({})

  const loadData = useCallback(async () => {
    try {
      const [p, aRes] = await Promise.all([
        fetchProjetoDetails(projectId),
        (supabase as any).from('analistas').select('id, nome').eq('status', 'Ativo').order('nome'),
      ])
      setProjeto(p)
      setAnalysts(aRes.data || [])
    } catch (e: any) {
      toast.error('Erro ao carregar projeto: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleUpdate = async (id: string, data: Partial<ProjetoAtividade>) => {
    if (!projeto) return
    const updatedAtividades = projeto.atividades.map((a) => (a.id === id ? { ...a, ...data } : a))
    setProjeto((prev) => (prev ? { ...prev, atividades: updatedAtividades } : null))
    try {
      await updateAtividade(id, data)
      await checkAndUpdateProgression(projectId, projeto.etapas, updatedAtividades)
      await loadData()
    } catch (e: any) {
      toast.error('Erro ao atualizar: ' + e.message)
    }
  }

  const handleAddExtra = async (etapaId: string) => {
    const name = newExtraName[etapaId]?.trim()
    if (!name) return
    try {
      await addExtraAtividade(projectId, etapaId, name)
      setNewExtraName((prev) => ({ ...prev, [etapaId]: '' }))
      toast.success('Atividade extra adicionada!')
      await loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAtividade(id)
      toast.success('Atividade removida!')
      await loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  if (loading || !projeto) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-3xl h-[85vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </DialogContent>
      </Dialog>
    )
  }

  const total = projeto.atividades.length
  const completed = projeto.atividades.filter((a) => a.is_completed).length
  const progress = total > 0 ? (completed / total) * 100 : 0
  const currentStepIdx = projeto.etapas.findIndex((e) => e.id === projeto.current_step_id)

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle className="text-xl">{projeto.name}</DialogTitle>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant={projeto.status === 'Concluído' ? 'default' : 'secondary'}>
              {projeto.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {completed} de {total} atividades concluídas
            </span>
          </div>
          <Progress value={progress} className="h-2 mt-3" />
        </DialogHeader>
        <div className="px-6 py-3 border-b shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {projeto.etapas.map((etapa, idx) => {
              const isCurrent = etapa.id === projeto.current_step_id
              const isPast = currentStepIdx > idx || projeto.status === 'Concluído'
              const etAtvs = projeto.atividades.filter((a) => a.etapa_id === etapa.id)
              const etDone = etAtvs.length > 0 && etAtvs.every((a) => a.is_completed)
              return (
                <div key={etapa.id} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      isPast || etDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : isCurrent
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isPast || etDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Circle className="w-3.5 h-3.5" />
                    )}
                    {etapa.name}
                  </div>
                  {idx < projeto.etapas.length - 1 && <div className="w-4 h-px bg-border" />}
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {projeto.etapas.map((etapa) => {
            const etAtvs = projeto.atividades.filter((a) => a.etapa_id === etapa.id)
            const isCurrent = etapa.id === projeto.current_step_id
            return (
              <div
                key={etapa.id}
                className={cn(
                  'rounded-xl border p-4 space-y-3',
                  isCurrent ? 'border-primary/30 bg-primary/5' : '',
                )}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">{etapa.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {etAtvs.length} atividades
                  </Badge>
                  {isCurrent && <Badge className="text-xs">Etapa Atual</Badge>}
                </div>
                <div className="space-y-3">
                  {etAtvs.map((a) => (
                    <AtividadeCard
                      key={a.id}
                      atividade={a}
                      analysts={analysts}
                      onUpdate={handleUpdate}
                      onDelete={a.is_extra ? handleDelete : undefined}
                    />
                  ))}
                  {etAtvs.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma atividade nesta etapa.
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newExtraName[etapa.id] || ''}
                    onChange={(e) =>
                      setNewExtraName((prev) => ({ ...prev, [etapa.id]: e.target.value }))
                    }
                    placeholder="Nome da atividade extra..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddExtra(etapa.id)
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddExtra(etapa.id)}
                    disabled={!newExtraName[etapa.id]?.trim()}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Extra
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
