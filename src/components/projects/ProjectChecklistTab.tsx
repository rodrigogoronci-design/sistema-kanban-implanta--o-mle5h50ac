import { useState } from 'react'
import { Project } from '@/stores/main'
import { useProjectChecklists } from '@/hooks/use-project-checklists'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Trash2, Plus, CheckCircle2, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Props {
  project: Project
}

export function ProjectChecklistTab({ project }: Props) {
  const { checklists, loading, addChecklist, toggleChecklist, deleteChecklist } =
    useProjectChecklists(project.id)
  const [newItem, setNewItem] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newItem.trim() || isSubmitting) return

    setIsSubmitting(true)
    const { error } = await addChecklist(project.id, newItem.trim())
    setIsSubmitting(false)

    if (error) {
      toast.error('Erro ao adicionar item', {
        description: 'Não foi possível salvar o item no momento. Tente novamente.',
      })
    } else {
      setNewItem('')
    }
  }

  const completedCount = checklists.filter((c) => c.is_completed).length
  const totalCount = checklists.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Progresso do Checklist</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {completedCount} de {totalCount} itens concluídos
        </p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          placeholder="Adicionar novo item ao checklist..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={!newItem.trim() || isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          Adicionar
        </Button>
      </form>

      <div className="space-y-3 mt-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground opacity-50" />
          </div>
        ) : checklists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 opacity-20" />
            <p>Nenhum item no checklist ainda.</p>
          </div>
        ) : (
          checklists.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-colors',
                item.is_completed ? 'bg-muted/50' : 'bg-card',
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={item.is_completed}
                  onCheckedChange={async (checked) => {
                    const { error } = await toggleChecklist(item.id, !!checked)
                    if (error) {
                      toast.error('Erro ao atualizar item', {
                        description: 'Não foi possível atualizar o status do item.',
                      })
                    }
                  }}
                  id={`check-${item.id}`}
                />
                <label
                  htmlFor={`check-${item.id}`}
                  className={cn(
                    'text-sm font-medium leading-none cursor-pointer select-none',
                    item.is_completed && 'line-through text-muted-foreground',
                  )}
                >
                  {item.title}
                </label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  const { error } = await deleteChecklist(item.id)
                  if (error) {
                    toast.error('Erro ao excluir item', {
                      description: 'Não foi possível remover o item.',
                    })
                  } else {
                    toast.success('Item removido com sucesso.')
                  }
                }}
                className="hover:bg-destructive/10 hover:text-destructive h-8 w-8"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
