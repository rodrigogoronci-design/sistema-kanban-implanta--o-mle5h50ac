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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, FileText, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { ProjetoAtividade } from '@/services/projetos-implantacao'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  'A Fazer',
  'Em andamento',
  'Aguardando Cliente',
  'Aguardando Desenvolvimento',
  'Concluído',
]

interface Props {
  atividade: ProjetoAtividade | null
  analysts: { id: string; nome: string }[]
  onClose: () => void
  onUpdate: (id: string, data: Partial<ProjetoAtividade>) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function AtividadeDetailModal({ atividade, analysts, onClose, onUpdate, onDelete }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('A Fazer')
  const [responsibleId, setResponsibleId] = useState<string | null>(null)
  const [forecastDate, setForecastDate] = useState<string | null>(null)
  const [realizationDate, setRealizationDate] = useState<string | null>(null)
  const [hoursSpent, setHoursSpent] = useState(0)
  const [minutesSpent, setMinutesSpent] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [ratUrl, setRatUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (atividade) {
      setName(atividade.name)
      setDescription(atividade.description || '')
      setStatus(atividade.status)
      setResponsibleId(atividade.responsible_id)
      setForecastDate(atividade.forecast_date)
      setRealizationDate(atividade.realization_date)
      setHoursSpent(atividade.hours_spent)
      setMinutesSpent(atividade.minutes_spent)
      setIsCompleted(atividade.is_completed)
      setRatUrl(atividade.rat_url || null)
    }
  }, [atividade])

  if (!atividade) return null

  const handleUploadRat = async (file: File) => {
    if (!atividade) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${atividade.id}-${Date.now()}.${ext}`
      const filePath = `${atividade.project_id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('rat-uploads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('rat-uploads').getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      await onUpdate(atividade.id, { rat_url: publicUrl })
      setRatUrl(publicUrl)
      toast.success('RAT enviado com sucesso!')
    } catch (e: any) {
      toast.error('Erro ao enviar arquivo: ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveRat = async () => {
    if (!atividade || !ratUrl) return
    try {
      await onUpdate(atividade.id, { rat_url: null })
      setRatUrl(null)
      toast.success('RAT removido!')
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  const handleSave = async () => {
    if (!atividade) return
    setSaving(true)
    try {
      const updates: Partial<ProjetoAtividade> = {
        name,
        description: description || null,
        status,
        responsible_id: responsibleId,
        forecast_date: forecastDate,
        realization_date: realizationDate,
        hours_spent: hoursSpent,
        minutes_spent: minutesSpent,
        is_completed: isCompleted,
      }
      if (isCompleted && !realizationDate) {
        const today = new Date().toISOString().split('T')[0]
        updates.realization_date = today
        setRealizationDate(today)
      }
      if (isCompleted && status !== 'Concluído') {
        updates.status = 'Concluído'
        setStatus('Concluído')
      }
      await onUpdate(atividade.id, updates)
      toast.success('Atividade atualizada!')
      onClose()
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!atividade || !onDelete) return
    setSaving(true)
    try {
      await onDelete(atividade.id)
      toast.success('Atividade removida!')
      onClose()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!atividade} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {atividade.is_extra && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                Extra
              </Badge>
            )}
            Detalhes da Atividade
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label>Responsável</Label>
              <Select
                value={responsibleId || 'none'}
                onValueChange={(v) => setResponsibleId(v === 'none' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-" />
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Data Agendada (Previsão)</Label>
              <Input
                type="date"
                value={forecastDate || ''}
                onChange={(e) => setForecastDate(e.target.value || null)}
              />
            </div>
            <div className="space-y-1">
              <Label>Data Realizada</Label>
              <Input
                type="date"
                value={realizationDate || ''}
                onChange={(e) => setRealizationDate(e.target.value || null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Horas</Label>
              <Input
                type="number"
                min="0"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1">
              <Label>Minutos</Label>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutesSpent}
                onChange={(e) => setMinutesSpent(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>RAT (Relatório de Atendimento Técnico)</Label>
            {ratUrl ? (
              <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/30">
                <FileText className="w-5 h-5 text-primary shrink-0" />
                <a
                  href={ratUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate flex-1 flex items-center gap-1"
                >
                  Ver arquivo <ExternalLink className="w-3 h-3" />
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive shrink-0"
                  onClick={handleRemoveRat}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 rounded-lg border border-dashed p-3 cursor-pointer hover:bg-muted/50 transition-colors text-sm text-muted-foreground',
                    uploading && 'opacity-50 pointer-events-none',
                  )}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Enviar RAT
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadRat(file)
                      e.target.value = ''
                    }}
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {atividade.is_extra && onDelete && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Excluir
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={saving}>
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
