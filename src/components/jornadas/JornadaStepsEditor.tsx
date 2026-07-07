import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

interface StepData {
  id?: string
  name: string
  position: number
  atividades: { id?: string; name: string; description?: string; estimated_hours?: number }[]
}

interface Props {
  steps: StepData[]
  onChange: (steps: StepData[]) => void
}

export function JornadaStepsEditor({ steps, onChange }: Props) {
  const addStep = () => onChange([...steps, { name: '', position: steps.length, atividades: [] }])
  const removeStep = (idx: number) =>
    onChange(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, position: i })))
  const updateStepName = (idx: number, name: string) =>
    onChange(steps.map((s, i) => (i === idx ? { ...s, name } : s)))
  const addAtividade = (idx: number) =>
    onChange(
      steps.map((s, i) =>
        i === idx
          ? {
              ...s,
              atividades: [
                ...s.atividades,
                { name: '', description: '', estimated_hours: undefined },
              ],
            }
          : s,
      ),
    )
  const removeAtividade = (idx: number, atvIdx: number) =>
    onChange(
      steps.map((s, i) =>
        i === idx ? { ...s, atividades: s.atividades.filter((_, j) => j !== atvIdx) } : s,
      ),
    )
  const updateAtividade = (idx: number, atvIdx: number, field: string, value: any) =>
    onChange(
      steps.map((s, i) =>
        i === idx
          ? {
              ...s,
              atividades: s.atividades.map((a, j) => (j === atvIdx ? { ...a, [field]: value } : a)),
            }
          : s,
      ),
    )

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => (
        <div key={idx} className="rounded-lg border p-4 space-y-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">
              Etapa {idx + 1}
            </span>
            <Input
              value={step.name}
              onChange={(e) => updateStepName(idx, e.target.value)}
              placeholder="Nome da etapa"
              className="flex-1 h-8"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive shrink-0"
              onClick={() => removeStep(idx)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          {step.atividades.map((atv, atvIdx) => (
            <div
              key={atvIdx}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px_auto] gap-2 items-end pl-4 border-l-2 border-primary/20"
            >
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Atividade</Label>
                <Input
                  value={atv.name}
                  onChange={(e) => updateAtividade(idx, atvIdx, 'name', e.target.value)}
                  placeholder="Nome"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <Input
                  value={atv.description || ''}
                  onChange={(e) => updateAtividade(idx, atvIdx, 'description', e.target.value)}
                  placeholder="Descrição"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Horas Est.</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={atv.estimated_hours ?? ''}
                  onChange={(e) =>
                    updateAtividade(
                      idx,
                      atvIdx,
                      'estimated_hours',
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeAtividade(idx, atvIdx)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addAtividade(idx)} className="ml-4">
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Atividade
          </Button>
        </div>
      ))}
      <Button variant="outline" onClick={addStep} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Adicionar Etapa
      </Button>
    </div>
  )
}
