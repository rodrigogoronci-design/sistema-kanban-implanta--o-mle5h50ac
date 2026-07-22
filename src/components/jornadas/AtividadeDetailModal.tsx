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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
import { Upload, FileText, Trash2, Loader2, ExternalLink, Plus, Clock, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { ProjetoAtividade } from '@/services/projetos-implantacao'
import { cn } from '@/lib/utils'
import {
  fetchTimeEntriesByAtividade,
  createTimeEntry,
  deleteTimeEntry,
  calculateDurationHours,
  formatDuration,
  ProjetoAtividadeTimeEntry,
} from '@/services/projeto-atividade-time-entries'

const STATUS_OPTIONS = [
  'A Fazer',
  'Em Andamento',
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
  const [isCompleted, setIsCompleted] = useState(false)
  const [ratUrl, setRatUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [timeEntries, setTimeEntries] = useState<ProjetoAtividadeTimeEntry[]>([])
  const [showTimeForm, setShowTimeForm] = useState(false)
  const [timeDate, setTimeDate] = useState('')
  const [timeStart, setTimeStart] = useState('')
  const [timeEnd, setTimeEnd] = useState('')
  const [timeObs, setTimeObs] = useState('')
  const [savingTime, setSavingTime] = useState(false)
  const [loadingTimes, setLoadingTimes] = useState(false)

  const loadTimeEntries = useCallback(async () => {
    if (!atividade) return
    setLoadingTimes(true)
    try {
      const entries = await fetchTimeEntriesByAtividade(atividade.id)
      setTimeEntries(entries)
    } catch (e: any) {
      toast.error('Erro ao carregar registros de horas: ' + e.message)
    } finally {
      setLoadingTimes(false)
    }
  }, [atividade])

  useEffect(() => {
    if (atividade) {
      setName(atividade.name)
      setDescription(atividade.description || '')
      setStatus(atividade.status)
      setResponsibleId(atividade.responsible_id)
      setForecastDate(atividade.forecast_date)
      setRealizationDate(atividade.realization_date)
      setIsCompleted(atividade.is_completed)
      setRatUrl(atividade.rat_url || null)
      setTimeEntries([])
      setShowTimeForm(false)
      setTimeDate(new Date().toISOString().split('T')[0])
      setTimeStart('')
      setTimeEnd('')
      setTimeObs('')
      loadTimeEntries()
    }
  }, [atividade, loadTimeEntries])

  if (!atividade) return null

  const totalTimeHours = timeEntries.reduce(
    (sum, e) => sum + calculateDurationHours(e.start_time, e.end_time),
    0,
  )

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
        is_completed: isCompleted,
      }
      if (isCompleted && !realizationDate) {
        const today = new Date().toISOString().split('T')[0]
        updates.realization_date = today
        updates.status = 'Concluído'
        updates.is_completed = true
        setRealizationDate(today)
      } else if (realizationDate) {
        updates.status = 'Concluído'
        updates.is_completed = true
      } else {
        updates.is_completed = false
      }
      await onUpdate(atividade.id, updates)

      const { data: refreshed } = await supabase
        .from('projeto_atividades')
        .select('*')
        .eq('id', atividade.id)
        .single()

      if (refreshed) {
        setName(refreshed.name)
        setDescription(refreshed.description || '')
        setStatus(refreshed.status)
        setResponsibleId(refreshed.responsible_id)
        setForecastDate(refreshed.forecast_date)
        setRealizationDate(refreshed.realization_date)
        setIsCompleted(refreshed.is_completed)
        setRatUrl(refreshed.rat_url || null)
      }

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

  const handleSaveTimeEntry = async () => {
    if (!atividade || !timeDate || !timeStart || !timeEnd) {
      toast.error('Preencha data, hora de início e fim.')
      return
    }
    const startISO = new Date(`${timeDate}T${timeStart}:00`).toISOString()
    const endISO = new Date(`${timeDate}T${timeEnd}:00`).toISOString()
    if (new Date(endISO) <= new Date(startISO)) {
      toast.error('A hora de fim deve ser posterior à hora de início.')
      return
    }
    setSavingTime(true)
    try {
      await createTimeEntry(atividade.id, startISO, endISO, timeObs || undefined)
      toast.success('Registro de horas adicionado!')
      setShowTimeForm(false)
      setTimeDate(new Date().toISOString().split('T')[0])
      setTimeStart('')
      setTimeEnd('')
      setTimeObs('')
      await loadTimeEntries()
    } catch (e: any) {
      toast.error('Erro ao salvar registro: ' + e.message)
    } finally {
      setSavingTime(false)
    }
  }

  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await deleteTimeEntry(entryId)
      toast.success('Registro removido!')
      await loadTimeEntries()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
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

        <Tabs defaultValue="details">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="time" className="flex-1">
              Registro de Horas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
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
                <Label className="flex items-center gap-1">
                  Status
                  {!responsibleId && <Lock className="w-3 h-3 text-muted-foreground" />}
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} disabled={!responsibleId && s !== 'A Fazer'}>
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
                  onValueChange={(v) => {
                    const newId = v === 'none' ? null : v
                    setResponsibleId(newId)
                    if (!newId) {
                      if (realizationDate) setRealizationDate(null)
                      if (status !== 'A Fazer') {
                        setStatus('A Fazer')
                        setIsCompleted(false)
                        toast.warning("Responsável removido, status foi redefinido para 'A Fazer'.")
                      }
                    }
                  }}
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
                <Label className="flex items-center gap-1">
                  Data Realizada
                  {!responsibleId && <Lock className="w-3 h-3 text-muted-foreground" />}
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={realizationDate || ''}
                    disabled={!responsibleId}
                    onChange={(e) => {
                      const val = e.target.value || null
                      setRealizationDate(val)
                      if (val) {
                        setStatus('Concluído')
                        setIsCompleted(true)
                      } else {
                        setIsCompleted(false)
                      }
                    }}
                    className={cn(!responsibleId && 'opacity-50 cursor-not-allowed')}
                  />
                  {!responsibleId && (
                    <div
                      className="absolute inset-0 cursor-not-allowed"
                      onClick={() =>
                        toast.error('Defina um responsável antes de preencher a data realizada.')
                      }
                    />
                  )}
                </div>
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
          </TabsContent>

          <TabsContent value="time" className="space-y-4 mt-4">
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Total de Horas da Atividade</span>
              </div>
              <Badge className="text-sm font-bold">{formatDuration(totalTimeHours)}</Badge>
            </div>

            {!showTimeForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTimeForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" /> Registrar Horas
              </Button>
            ) : (
              <div className="rounded-lg border p-4 space-y-3 bg-card">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Data</Label>
                    <Input
                      type="date"
                      value={timeDate}
                      onChange={(e) => setTimeDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Início</Label>
                    <Input
                      type="time"
                      value={timeStart}
                      onChange={(e) => setTimeStart(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fim</Label>
                    <Input
                      type="time"
                      value={timeEnd}
                      onChange={(e) => setTimeEnd(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Observação</Label>
                  <Input
                    value={timeObs}
                    onChange={(e) => setTimeObs(e.target.value)}
                    placeholder="Observação opcional..."
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTimeForm(false)}
                    disabled={savingTime}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveTimeEntry} disabled={savingTime}>
                    {savingTime ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Salvando...
                      </>
                    ) : (
                      'Salvar'
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-lg border overflow-hidden">
              {loadingTimes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : timeEntries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum registro de horas para esta atividade.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Data</TableHead>
                      <TableHead className="text-xs">Início</TableHead>
                      <TableHead className="text-xs">Fim</TableHead>
                      <TableHead className="text-xs">Duração</TableHead>
                      <TableHead className="text-xs">Observação</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => {
                      const startDate = new Date(entry.start_time)
                      const endDate = new Date(entry.end_time)
                      const duration = calculateDurationHours(entry.start_time, entry.end_time)
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs">
                            {startDate.toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-xs">
                            {startDate.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-xs">
                            {endDate.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {formatDuration(duration)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                            {entry.description || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDeleteTimeEntry(entry.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
