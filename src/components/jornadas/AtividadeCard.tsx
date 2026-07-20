import { ProjetoAtividade } from '@/services/projetos-implantacao'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  'A Fazer',
  'Em andamento',
  'Aguardando Cliente',
  'Aguardando Desenvolvimento',
  'Concluído',
]

interface Props {
  atividade: ProjetoAtividade
  analysts: { id: string; nome: string }[]
  onUpdate: (id: string, data: Partial<ProjetoAtividade>) => void
  onDelete?: (id: string) => void
}

export function AtividadeCard({ atividade, analysts, onUpdate, onDelete }: Props) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 space-y-3 transition-colors',
        atividade.is_completed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-card',
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={atividade.is_completed}
            onCheckedChange={(checked) => {
              const updates: Partial<ProjetoAtividade> = {
                is_completed: checked === true,
                status: checked ? 'Concluído' : 'A Fazer',
              }
              if (checked === true && !atividade.realization_date) {
                updates.realization_date = new Date().toISOString().split('T')[0]
              }
              onUpdate(atividade.id, updates)
            }}
          />
          {atividade.is_extra && (
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
              Extra
            </Badge>
          )}
        </div>
        {atividade.is_extra && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete(atividade.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Nome</Label>
          <Input
            value={atividade.name}
            onChange={(e) => onUpdate(atividade.id, { name: e.target.value })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Responsável</Label>
          <Select
            value={atividade.responsible_id || 'none'}
            onValueChange={(v) =>
              onUpdate(atividade.id, { responsible_id: v === 'none' ? null : v })
            }
          >
            <SelectTrigger className="h-8 text-sm">
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
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Descrição</Label>
        <Textarea
          value={atividade.description || ''}
          onChange={(e) => onUpdate(atividade.id, { description: e.target.value })}
          rows={2}
          className="text-sm resize-none"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={atividade.status}
            onValueChange={(v) => onUpdate(atividade.id, { status: v })}
          >
            <SelectTrigger className="h-8 text-sm">
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
          <Label className="text-xs text-muted-foreground">Previsão</Label>
          <Input
            type="date"
            value={atividade.forecast_date || ''}
            onChange={(e) => onUpdate(atividade.id, { forecast_date: e.target.value || null })}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Realização</Label>
          <Input
            type="date"
            value={atividade.realization_date || ''}
            onChange={(e) => onUpdate(atividade.id, { realization_date: e.target.value || null })}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
