import { useState } from 'react'
import { Task, TimeEntry } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  task: Task
  onUpdate: (payload: Partial<Task>) => void
}

export function TaskActivities({ task, onUpdate }: Props) {
  const [activityErrors, setActivityErrors] = useState<Record<string, string>>({})

  const handleUpdateActivity = (id: string, field: keyof TimeEntry, value: string) => {
    const updatedEntries = task.timeEntries.map((entry) => {
      if (entry.id === id) {
        const updated = { ...entry, [field]: value }
        if (updated.start && updated.end && new Date(updated.end) < new Date(updated.start)) {
          setActivityErrors((prev) => ({
            ...prev,
            [id]: 'A data final não pode ser anterior à inicial',
          }))
        } else {
          setActivityErrors((prev) => {
            const next = { ...prev }
            delete next[id]
            return next
          })
        }
        return updated
      }
      return entry
    })
    onUpdate({ timeEntries: updatedEntries })
  }

  const addActivity = () => {
    onUpdate({
      timeEntries: [
        ...task.timeEntries,
        { id: Math.random().toString(), start: '', end: '', observation: '' },
      ],
    })
  }

  const removeActivity = (id: string) => {
    onUpdate({ timeEntries: task.timeEntries.filter((t) => t.id !== id) })
    setActivityErrors((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base text-foreground font-semibold">Registro de Atividades</Label>
        <Button variant="outline" size="sm" onClick={addActivity}>
          <Plus className="w-4 h-4 mr-2" /> Nova Atividade
        </Button>
      </div>

      <div className="space-y-3 mt-2">
        {task.timeEntries.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-3 bg-muted/40 p-3 rounded-lg border">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Início</Label>
                <Input
                  type="datetime-local"
                  value={entry.start}
                  onChange={(e) => handleUpdateActivity(entry.id, 'start', e.target.value)}
                  className={cn(
                    activityErrors[entry.id] && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fim</Label>
                <Input
                  type="datetime-local"
                  value={entry.end}
                  onChange={(e) => handleUpdateActivity(entry.id, 'end', e.target.value)}
                  className={cn(
                    activityErrors[entry.id] && 'border-destructive focus-visible:ring-destructive',
                  )}
                />
              </div>
            </div>
            {activityErrors[entry.id] && (
              <p className="text-xs text-destructive">{activityErrors[entry.id]}</p>
            )}
            <div className="flex gap-3 items-start">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Observação</Label>
                <Textarea
                  value={entry.observation}
                  onChange={(e) => handleUpdateActivity(entry.id, 'observation', e.target.value)}
                  rows={2}
                  placeholder="Detalhes da atividade..."
                  className="resize-none text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive mt-6 shrink-0 hover:bg-destructive/10"
                onClick={() => removeActivity(entry.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {task.timeEntries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg bg-muted/20">
            Nenhuma atividade registrada.
          </p>
        )}
      </div>
    </div>
  )
}
