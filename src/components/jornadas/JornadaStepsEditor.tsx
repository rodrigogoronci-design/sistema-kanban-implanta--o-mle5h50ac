import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

interface StepData {
  id?: string
  name: string
  position: number
  atividades: { id?: string; name: string; description?: string }[]
}

interface Props {
  steps: StepData[]
  onChange: (steps: StepData[]) => void
}

export function JornadaStepsEditor({ steps, onChange }: Props) {
  const [openItems, setOpenItems] = useState<string[]>([])

  const addStep = () => {
    const newIdx = steps.length
    onChange([...steps, { name: '', position: newIdx, atividades: [] }])
    setOpenItems((prev) => [...prev, `step-${newIdx}`])
  }

  const removeStep = (idx: number) => {
    const removedValue = `step-${idx}`
    onChange(steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, position: i })))
    setOpenItems((prev) =>
      prev
        .filter((v) => v !== removedValue)
        .map((v) => {
          const num = parseInt(v.split('-')[1])
          return num > idx ? `step-${num - 1}` : v
        }),
    )
  }

  const updateStepName = (idx: number, name: string) =>
    onChange(steps.map((s, i) => (i === idx ? { ...s, name } : s)))

  const addAtividade = (idx: number) =>
    onChange(
      steps.map((s, i) =>
        i === idx ? { ...s, atividades: [...s.atividades, { name: '', description: '' }] } : s,
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
      {steps.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhuma etapa adicionada. Clique em "Adicionar Etapa" para começar.
        </p>
      )}
      <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
        {steps.map((step, idx) => {
          const itemValue = `step-${idx}`
          return (
            <AccordionItem
              key={idx}
              value={itemValue}
              className="rounded-lg border px-4 mb-3 bg-muted/20 border-border"
            >
              <div className="flex items-center gap-2">
                <AccordionTrigger className="flex-1 hover:no-underline py-3 [&[data-state=open]>svg]:rotate-180">
                  <div className="flex items-center gap-2 flex-1 text-left">
                    <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">
                      Etapa {idx + 1}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-medium truncate',
                        !step.name && 'text-muted-foreground italic',
                      )}
                    >
                      {step.name || 'Sem nome'}
                    </span>
                    {step.atividades.length > 0 && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {step.atividades.length}{' '}
                        {step.atividades.length === 1 ? 'atividade' : 'atividades'}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive shrink-0"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeStep(idx)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <AccordionContent>
                <div className="space-y-2 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Nome da Etapa</Label>
                    <Input
                      value={step.name}
                      onChange={(e) => updateStepName(idx, e.target.value)}
                      placeholder="Nome da etapa"
                      className="h-8"
                    />
                  </div>
                  {step.atividades.map((atv, atvIdx) => (
                    <div
                      key={atvIdx}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end pl-4 border-l-2 border-primary/20"
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
                          onChange={(e) =>
                            updateAtividade(idx, atvIdx, 'description', e.target.value)
                          }
                          placeholder="Descrição"
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addAtividade(idx)}
                    className="ml-4"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Atividade
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
      <Button variant="outline" onClick={addStep} className="w-full">
        <Plus className="w-4 h-4 mr-2" /> Adicionar Etapa
      </Button>
    </div>
  )
}
