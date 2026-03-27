import { Task } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  task: Task
  onUpdate: (payload: Partial<Task>) => void
}

export function TaskChecklist({ task, onUpdate }: Props) {
  const handleAdd = () => {
    const input = document.getElementById('new-check') as HTMLInputElement
    if (input.value.trim()) {
      onUpdate({
        checklist: [
          ...task.checklist,
          { id: Math.random().toString(), title: input.value, completed: false },
        ],
      })
      input.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <Label className="text-base text-foreground font-semibold">Subtarefas (Checklist)</Label>
      <div className="flex items-center gap-2">
        <Input
          id="new-check"
          placeholder="Nova subtarefa..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd()
          }}
        />
        <Button variant="secondary" onClick={handleAdd}>
          Add
        </Button>
      </div>
      <div className="space-y-2 mt-2">
        {task.checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md transition-colors group/check"
          >
            <Checkbox
              checked={item.completed}
              onCheckedChange={(c) => {
                const newChecklist = task.checklist.map((ch) =>
                  ch.id === item.id ? { ...ch, completed: !!c } : ch,
                )
                onUpdate({ checklist: newChecklist })
              }}
            />
            <Input
              value={item.title}
              onChange={(e) => {
                const newChecklist = task.checklist.map((ch) =>
                  ch.id === item.id ? { ...ch, title: e.target.value } : ch,
                )
                onUpdate({ checklist: newChecklist })
              }}
              className={cn(
                'flex-1 h-8 bg-transparent border-transparent hover:border-input focus-visible:bg-background px-2',
                item.completed && 'line-through text-muted-foreground',
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover/check:opacity-100 transition-opacity shrink-0"
              onClick={() =>
                onUpdate({ checklist: task.checklist.filter((c) => c.id !== item.id) })
              }
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {task.checklist.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
            Nenhuma subtarefa adicionada.
          </p>
        )}
      </div>
    </div>
  )
}
