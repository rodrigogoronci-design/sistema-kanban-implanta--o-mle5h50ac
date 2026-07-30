import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { AtividadeWithRelations } from '@/services/minhas-atividades'

const STATUS_OPTIONS = [
  'A Fazer',
  'Em Andamento',
  'Aguardando Cliente',
  'Aguardando Desenvolvimento',
  'Concluído',
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysts: { id: string; nome: string }[]
  clients: { id: string; name: string }[]
  onCreated: (atividade: AtividadeWithRelations) => void
}

export function CreateAtividadeModal({ open, onOpenChange, analysts, clients, onCreated }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [etapaId, setEtapaId] = useState('')
  const [clientId, setClientId] = useState('')
  const [responsibleId, setResponsibleId] = useState('')
  const [status, setStatus] = useState('A Fazer')
  const [forecastDate, setForecastDate] = useState('')
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [etapas, setEtapas] = useState<{ id: string; name: string }[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [loadingEtapas, setLoadingEtapas] = useState(false)
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setName('')
    setDescription('')
    setProjectId('')
    setEtapaId('')
    setClientId('')
    setResponsibleId('')
    setStatus('A Fazer')
    setForecastDate('')
    setEtapas([])
  }

  useEffect(() => {
    if (open) {
      resetForm()
      setLoadingProjects(true)
      supabase
        .from('projetos_implantacao')
        .select('id, name')
        .order('name')
        .then(({ data }) => {
          setProjects(data || [])
          setLoadingProjects(false)
        })
    }
  }, [open])

  const loadEtapas = useCallback(async (pId: string) => {
    setLoadingEtapas(true)
    setEtapaId('')
    try {
      const { data: existing } = await supabase
        .from('jornada_etapas')
        .select('id, name')
        .eq('project_id', pId)
        .order('position', { ascending: true })

      if (existing && existing.length > 0) {
        setEtapas(existing)
        setEtapaId(existing[0].id)
        return
      }

      const { data: newEtapa, error } = await supabase
        .from('jornada_etapas')
        .insert({
          name: 'Geral',
          project_id: pId,
          position: 1,
          jornada_id: null,
        })
        .select('id, name')
        .single()

      if (error) throw error
      if (newEtapa) {
        setEtapas([newEtapa])
        setEtapaId(newEtapa.id)
      }
    } catch (e: any) {
      toast.error('Erro ao carregar etapas: ' + e.message)
      setEtapas([])
    } finally {
      setLoadingEtapas(false)
    }
  }, [])

  useEffect(() => {
    if (projectId) {
      loadEtapas(projectId)
    } else {
      setEtapas([])
      setEtapaId('')
    }
  }, [projectId, loadEtapas])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('O campo Nome é obrigatório.')
      return
    }
    if (!projectId) {
      toast.error('Selecione um projeto.')
      return
    }
    if (!etapaId) {
      toast.error('Selecione uma etapa.')
      return
    }

    setSaving(true)
    try {
      const insertData = {
        name: name.trim(),
        description: description.trim() || null,
        project_id: projectId,
        etapa_id: etapaId,
        client_id: clientId || null,
        responsible_id: responsibleId || null,
        status,
        forecast_date: forecastDate || null,
        priority: 'Média',
        is_extra: false,
        is_completed: status === 'Concluído',
        hours_spent: 0,
        minutes_spent: 0,
      }

      const { data: newAtividade, error } = await supabase
        .from('projeto_atividades')
        .insert(insertData)
        .select('*')
        .single()

      if (error) throw error

      let projeto_name: string | null = null
      let resolved_client_id: string | null = newAtividade.client_id
      let client_name: string | null = null

      const { data: projeto } = await supabase
        .from('projetos_implantacao')
        .select('id, name, client_id')
        .eq('id', projectId)
        .single()

      if (projeto) {
        projeto_name = projeto.name
        if (!resolved_client_id && projeto.client_id) {
          resolved_client_id = projeto.client_id
        }
      }

      if (resolved_client_id) {
        const { data: client } = await supabase
          .from('clients')
          .select('id, name')
          .eq('id', resolved_client_id)
          .single()
        client_name = client?.name || null
      }

      const atividadeWithRelations: AtividadeWithRelations = {
        ...newAtividade,
        projeto_name,
        client_id: resolved_client_id,
        client_name,
      }

      onCreated(atividadeWithRelations)
      toast.success('Atividade criada com sucesso!')
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Erro ao criar atividade: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da atividade"
            />
          </div>
          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição opcional..."
              rows={2}
              className="resize-none"
            />
          </div>
          <div className="space-y-1">
            <Label>Projeto *</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {loadingProjects ? (
                  <SelectItem value="_loading" disabled>
                    Carregando...
                  </SelectItem>
                ) : (
                  projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Etapa</Label>
            <Select
              value={etapaId}
              onValueChange={setEtapaId}
              disabled={!projectId || loadingEtapas}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingEtapas ? 'Carregando...' : 'Selecione uma etapa'}
                />
              </SelectTrigger>
              <SelectContent>
                {etapas.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
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
          <div className="space-y-1">
            <Label>Responsável</Label>
            <Select value={responsibleId} onValueChange={setResponsibleId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um responsável" />
              </SelectTrigger>
              <SelectContent>
                {analysts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Data de Previsão</Label>
              <Input
                type="date"
                value={forecastDate}
                onChange={(e) => setForecastDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Criando...
              </>
            ) : (
              'Criar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
