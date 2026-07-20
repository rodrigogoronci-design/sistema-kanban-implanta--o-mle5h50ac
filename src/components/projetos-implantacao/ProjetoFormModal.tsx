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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Jornada } from '@/services/jornadas'
import { ProjetoImplantacao, createProjeto, updateProjeto } from '@/services/projetos-implantacao'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProjeto?: ProjetoImplantacao | null
  jornadas: Jornada[]
  clients: { id: string; name: string }[]
  analysts: { id: string; nome: string }[]
  onSaved: () => void
}

export function ProjetoFormModal({
  open,
  onOpenChange,
  editingProjeto,
  jornadas,
  clients,
  analysts,
  onSaved,
}: Props) {
  const [name, setName] = useState('')
  const [jornadaId, setJornadaId] = useState('')
  const [clientId, setClientId] = useState('')
  const [analystId, setAnalystId] = useState('')
  const [dataDemanda, setDataDemanda] = useState<Date | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (editingProjeto) {
        setName(editingProjeto.name)
        setJornadaId(editingProjeto.jornada_id || '')
        setClientId(editingProjeto.client_id || '')
        setAnalystId(editingProjeto.analyst_id || '')
        setDataDemanda(
          editingProjeto.data_demanda
            ? new Date(editingProjeto.data_demanda + 'T00:00:00')
            : undefined,
        )
      } else {
        setName('')
        setJornadaId('')
        setClientId('')
        setAnalystId('')
        setDataDemanda(undefined)
      }
    }
  }, [open, editingProjeto])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Preencha o nome do projeto.')
      return
    }
    setSaving(true)
    try {
      const clientVal = clientId || null
      const analystVal = analystId || null
      const dataVal = dataDemanda ? format(dataDemanda, 'yyyy-MM-dd') : null
      if (editingProjeto) {
        await updateProjeto(editingProjeto.id, {
          name: name.trim(),
          client_id: clientVal,
          analyst_id: analystVal,
          data_demanda: dataVal,
        })
        toast.success('Projeto atualizado!')
      } else {
        await createProjeto(
          name.trim(),
          jornadaId || undefined,
          clientVal || undefined,
          analystVal || undefined,
          dataVal || undefined,
        )
        toast.success('Projeto criado!')
      }
      onOpenChange(false)
      onSaved()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingProjeto ? 'Editar Projeto' : 'Novo Projeto de Implantação'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Projeto *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Implantação Cliente X"
            />
          </div>
          <div className="space-y-2">
            <Label>Jornada (Template)</Label>
            <Select
              value={jornadaId || 'none'}
              onValueChange={(v) => setJornadaId(v === 'none' ? '' : v)}
              disabled={!!editingProjeto}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma jornada" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem jornada (etapas dinâmicas)</SelectItem>
                {jornadas.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Opcional. Sem jornada, as etapas podem ser criadas dinamicamente.
            </p>
            {editingProjeto && (
              <p className="text-xs text-muted-foreground">
                A jornada não pode ser alterada após a criação.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select
              value={clientId || 'none'}
              onValueChange={(v) => setClientId(v === 'none' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
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
            <Select
              value={analystId || 'none'}
              onValueChange={(v) => setAnalystId(v === 'none' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um analista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {analysts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data da Demanda</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dataDemanda && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataDemanda
                    ? format(dataDemanda, 'dd/MM/yyyy', { locale: ptBR })
                    : 'Selecionar data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataDemanda}
                  onSelect={setDataDemanda}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : editingProjeto ? 'Salvar' : 'Criar Projeto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
