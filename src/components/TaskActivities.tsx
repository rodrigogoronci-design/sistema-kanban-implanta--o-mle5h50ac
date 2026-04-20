import { useState } from 'react'
import { Task } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Save } from 'lucide-react'

interface Props {
  task: Task
  onUpdate: (payload: Partial<Task>) => void
}

export function TaskActivities({ task, onUpdate }: Props) {
  const [newActivity, setNewActivity] = useState({ start_time: '', end_time: '', observation: '' })
  const [error, setError] = useState('')

  const handleSaveActivity = () => {
    if (!newActivity.start_time || !newActivity.end_time) {
      setError('Preencha os campos de início e fim')
      return
    }
    if (new Date(newActivity.end_time) < new Date(newActivity.start_time)) {
      setError('A data final não pode ser anterior à inicial')
      return
    }

    const uuid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
              v = c === 'x' ? r : (r & 0x3) | 0x8
            return v.toString(16)
          })

    onUpdate({
      timeEntries: [
        ...(task.timeEntries || []),
        {
          id: uuid,
          start: newActivity.start_time,
          end: newActivity.end_time,
          observation: newActivity.observation,
        },
      ],
    })

    setNewActivity({ start_time: '', end_time: '', observation: '' })
    setError('')
  }

  const removeActivity = (id: string) => {
    onUpdate({ timeEntries: (task.timeEntries || []).filter((t) => t.id !== id) })
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString()
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-base text-foreground font-semibold">Registro de Atividades</Label>

      <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-3">
        <h4 className="text-sm font-medium text-foreground">Nova Atividade</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Início</Label>
            <Input
              type="datetime-local"
              value={newActivity.start_time}
              onChange={(e) => setNewActivity((s) => ({ ...s, start_time: e.target.value }))}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs text-muted-foreground">Fim</Label>
            <Input
              type="datetime-local"
              value={newActivity.end_time}
              onChange={(e) => setNewActivity((s) => ({ ...s, end_time: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Observação</Label>
          <Textarea
            value={newActivity.observation}
            onChange={(e) => setNewActivity((s) => ({ ...s, observation: e.target.value }))}
            rows={2}
            placeholder="Detalhes da atividade..."
            className="resize-none text-sm bg-background"
          />
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button onClick={handleSaveActivity} className="w-full sm:w-auto mt-2">
          <Save className="w-4 h-4 mr-2" /> Salvar Atividade
        </Button>
      </div>

      <div className="space-y-3 mt-4">
        {(task.timeEntries || []).map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col gap-2 bg-background p-3 rounded-lg border border-border/50 shadow-sm"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="text-sm text-foreground space-y-1">
                <div>
                  <span className="font-medium text-muted-foreground">Início:</span>{' '}
                  {formatDate((entry as any).start_time || entry.start)}
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Fim:</span>{' '}
                  {formatDate((entry as any).end_time || entry.end)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => removeActivity(entry.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            {entry.observation && (
              <div className="text-sm text-muted-foreground bg-muted/40 p-2 rounded mt-1">
                {entry.observation}
              </div>
            )}
          </div>
        ))}
        {(!task.timeEntries || task.timeEntries.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg bg-muted/10">
            Nenhuma atividade registrada.
          </p>
        )}
      </div>
    </div>
  )
}
