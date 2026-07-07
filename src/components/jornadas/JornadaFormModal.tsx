import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  createJornada,
  updateJornada,
  saveJornadaStructure,
  fetchJornadaDetails,
  JornadaWithDetails,
} from '@/services/jornadas'
import { JornadaStepsEditor } from './JornadaStepsEditor'

interface StepData {
  id?: string
  name: string
  position: number
  atividades: { id?: string; name: string; description?: string }[]
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  jornadaId?: string | null
  clients: { id: string; name: string }[]
  onSaved: () => void
}

export function JornadaFormModal({ open, onOpenChange, jornadaId, clients, onSaved }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [clientId, setClientId] = useState('')
  const [steps, setSteps] = useState<StepData[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && jornadaId) {
      fetchJornadaDetails(jornadaId).then((data: JornadaWithDetails) => {
        setName(data.name)
        setDescription(data.description || '')
        setClientId(data.client_id || '')
        setSteps(
          data.etapas.map((e) => ({
            name: e.name,
            position: e.position,
            atividades: e.atividades.map((a) => ({
              name: a.name,
              description: a.description || '',
            })),
          })),
        )
      })
    } else if (open) {
      setName('')
      setDescription('')
      setClientId('')
      setSteps([])
    }
  }, [open, jornadaId])

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Informe o nome da jornada.')
      return
    }
    setSaving(true)
    try {
      let id = jornadaId
      if (id) {
        await updateJornada(id, { name, description, client_id: clientId || undefined })
      } else {
        const j = await createJornada({ name, description, client_id: clientId || undefined })
        id = j.id
      }
      await saveJornadaStructure(
        id!,
        steps.map((s, i) => ({ ...s, position: i })),
      )
      toast.success('Jornada salva com sucesso!')
      onOpenChange(false)
      onSaved()
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <DialogTitle>{jornadaId ? 'Editar Jornada' : 'Nova Jornada'}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="info" className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 pt-4 shrink-0">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="steps">Etapas e Atividades</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="info" className="flex-1 overflow-y-auto p-6 m-0 space-y-4">
            <div className="space-y-2">
              <Label>Nome da Jornada *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Implantação ERP Padrão"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Descreva o objetivo desta jornada..."
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Empresa Vinculada</Label>
              <Select
                value={clientId || 'none'}
                onValueChange={(v) => setClientId(v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          <TabsContent value="steps" className="flex-1 overflow-y-auto p-6 m-0">
            <JornadaStepsEditor steps={steps} onChange={setSteps} />
          </TabsContent>
        </Tabs>
        <div className="p-4 border-t bg-muted/10 flex justify-end gap-2 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
