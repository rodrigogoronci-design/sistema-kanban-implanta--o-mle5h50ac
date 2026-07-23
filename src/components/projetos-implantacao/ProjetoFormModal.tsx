import { useState, useEffect } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase/client'
import { createProjeto, updateProjeto, ProjetoImplantacao } from '@/services/projetos-implantacao'
import { toast } from '@/hooks/use-toast'

interface ProjetoFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projeto?: ProjetoImplantacao | null
  onSaved?: () => void
}

interface ClientOption {
  id: string
  name: string
}
interface AnalystOption {
  id: string
  nome: string
}

export function ProjetoFormModal({ open, onOpenChange, projeto, onSaved }: ProjetoFormModalProps) {
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState('')
  const [analystId, setAnalystId] = useState('')
  const [status, setStatus] = useState('Ativo')
  const [dataDemanda, setDataDemanda] = useState('')
  const [isNewClient, setIsNewClient] = useState(false)
  const [priority, setPriority] = useState('Média')
  const [forecastStart, setForecastStart] = useState('')
  const [forecastEnd, setForecastEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [clients, setClients] = useState<ClientOption[]>([])
  const [analysts, setAnalysts] = useState<AnalystOption[]>([])

  useEffect(() => {
    if (projeto) {
      setName(projeto.name || '')
      setClientId(projeto.client_id || '')
      setAnalystId(projeto.analyst_id || '')
      setStatus(projeto.status || 'Ativo')
      setDataDemanda(projeto.data_demanda || '')
      setIsNewClient(projeto.is_new_client || false)
      setPriority(projeto.priority || 'Média')
      setForecastStart(projeto.forecast_start ? projeto.forecast_start.split('T')[0] : '')
      setForecastEnd(projeto.forecast_end ? projeto.forecast_end.split('T')[0] : '')
      setNotes(projeto.notes || '')
    } else {
      setName('')
      setClientId('')
      setAnalystId('')
      setStatus('Ativo')
      setDataDemanda('')
      setIsNewClient(false)
      setPriority('Média')
      setForecastStart('')
      setForecastEnd('')
      setNotes('')
    }
  }, [projeto, open])

  useEffect(() => {
    const fetchOptions = async () => {
      const [{ data: clientsData }, { data: analystsData }] = await Promise.all([
        supabase.from('clients').select('id, name').order('name'),
        supabase.from('analistas').select('id, nome').eq('status', 'Ativo').order('nome'),
      ])
      setClients(clientsData || [])
      setAnalysts(analystsData || [])
    }
    fetchOptions()
  }, [])

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const data = {
        name: name.trim(),
        client_id: clientId || null,
        analyst_id: analystId || null,
        status,
        data_demanda: dataDemanda || null,
        is_new_client: isNewClient,
        priority,
        forecast_start: forecastStart || null,
        forecast_end: forecastEnd || null,
        notes: notes.trim() || null,
      }

      if (projeto) {
        await updateProjeto(projeto.id, data)
        toast({ title: 'Sucesso', description: 'Projeto atualizado' })
      } else {
        await createProjeto(data)
        toast({ title: 'Sucesso', description: 'Projeto criado' })
      }

      onSaved?.()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao salvar projeto', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{projeto ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proj-name">Nome</Label>
            <Input
              id="proj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do projeto"
            />
          </div>
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label>Analista Responsável</Label>
            <Select value={analystId} onValueChange={setAnalystId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um analista" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proj-data-demanda">Data da Demanda</Label>
              <Input
                id="proj-data-demanda"
                type="date"
                value={dataDemanda}
                onChange={(e) => setDataDemanda(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proj-forecast-start">Previsão Início</Label>
              <Input
                id="proj-forecast-start"
                type="date"
                value={forecastStart}
                onChange={(e) => setForecastStart(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proj-forecast-end">Previsão Fim</Label>
              <Input
                id="proj-forecast-end"
                type="date"
                value={forecastEnd}
                onChange={(e) => setForecastEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="proj-notes">Observações</Label>
            <Textarea
              id="proj-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o projeto"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="proj-is-new-client"
              checked={isNewClient}
              onCheckedChange={(checked) => setIsNewClient(checked === true)}
            />
            <Label htmlFor="proj-is-new-client" className="cursor-pointer">
              Novo Cliente
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
