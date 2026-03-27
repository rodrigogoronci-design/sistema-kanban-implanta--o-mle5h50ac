import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Play, Square, Clock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

export default function TaskDrawer({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const { tasks, updateTask, users, clients } = useMainStore()
  const task = tasks.find((t) => t.id === taskId)

  const [timerStart, setTimerStart] = useState<Date | null>(null)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerStart) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - timerStart.getTime()) / 1000))
      }, 1000)
    } else {
      setElapsed(0)
    }
    return () => clearInterval(interval)
  }, [timerStart])

  if (!task) return null

  const handleToggleTimer = () => {
    if (timerStart) {
      const duration = Math.floor((Date.now() - timerStart.getTime()) / 1000)
      const newEntry = {
        id: Math.random().toString(),
        start: timerStart.toISOString(),
        end: new Date().toISOString(),
        duration,
      }
      updateTask(task.id, { timeEntries: [...task.timeEntries, newEntry] })
      setTimerStart(null)
    } else {
      setTimerStart(new Date())
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const totalTrackedSeconds =
    task.timeEntries.reduce((acc, curr) => acc + (curr.duration || 0), 0) + elapsed

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-md w-full overflow-hidden flex flex-col p-0">
        <div className="p-6 pb-4 bg-muted/20 border-b">
          <SheetHeader>
            <SheetTitle className="text-xl text-primary">{task.title}</SheetTitle>
            <SheetDescription className="font-medium">
              {clients.find((c) => c.id === task.clientId)?.name}
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="flex flex-col gap-6 py-6">
            {/* Time Tracking */}
            <div className="bg-secondary/50 rounded-xl p-4 flex items-center justify-between border border-border/50">
              <div className="flex items-center gap-3">
                <div className="bg-background p-2 rounded-md shadow-sm border">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Tempo Registrado</p>
                  <p className="text-lg font-bold font-mono tracking-tight text-primary">
                    {formatTime(totalTrackedSeconds)}
                  </p>
                </div>
              </div>
              <Button
                variant={timerStart ? 'destructive' : 'default'}
                size="sm"
                onClick={handleToggleTimer}
                className="w-28 shadow-sm"
              >
                {timerStart ? (
                  <>
                    <Square className="w-4 h-4 mr-2" /> Parar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" /> Iniciar
                  </>
                )}
              </Button>
            </div>

            {/* Details Form */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Prioridade</Label>
                  <Select
                    value={task.priority}
                    onValueChange={(val: any) => updateTask(task.id, { priority: val })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Responsável</Label>
                  <Select
                    value={task.responsibleId}
                    onValueChange={(val: any) => updateTask(task.id, { responsibleId: val })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Descrição</Label>
                <Textarea
                  value={task.description}
                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                  rows={4}
                  className="resize-none bg-background"
                  placeholder="Adicione detalhes sobre a tarefa..."
                />
              </div>
            </div>

            <Separator />

            {/* Checklist */}
            <div className="space-y-4">
              <Label className="text-base text-foreground font-semibold">
                Subtarefas (Checklist)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-check"
                  placeholder="Nova subtarefa..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value
                      if (val.trim()) {
                        updateTask(task.id, {
                          checklist: [
                            ...task.checklist,
                            { id: Math.random().toString(), title: val, completed: false },
                          ],
                        })
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const input = document.getElementById('new-check') as HTMLInputElement
                    if (input.value.trim()) {
                      updateTask(task.id, {
                        checklist: [
                          ...task.checklist,
                          { id: Math.random().toString(), title: input.value, completed: false },
                        ],
                      })
                      input.value = ''
                    }
                  }}
                >
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
                        updateTask(task.id, { checklist: newChecklist })
                      }}
                    />
                    <span
                      className={`text-sm font-medium ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                    >
                      {item.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover/check:opacity-100 transition-opacity"
                      onClick={() => {
                        updateTask(task.id, {
                          checklist: task.checklist.filter((c) => c.id !== item.id),
                        })
                      }}
                    >
                      ✕
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
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
