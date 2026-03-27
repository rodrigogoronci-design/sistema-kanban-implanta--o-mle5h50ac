import { useState } from 'react'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export default function Projects() {
  const { projects, clients, users, addProject, deleteProject } = useMainStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', clientId: '', analystId: '', implStart: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.clientId) return

    addProject({
      id: Math.random().toString(),
      name: formData.name,
      clientId: formData.clientId,
      analystId: formData.analystId,
      implStart: formData.implStart ? new Date(formData.implStart).toISOString() : undefined,
    })
    setFormData({ name: '', clientId: '', analystId: '', implStart: '' })
    setOpen(false)
    toast({ title: 'Sucesso', description: 'Projeto criado com sucesso!' })
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-'
    return format(new Date(isoString), 'dd/MM/yyyy', { locale: ptBR })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Projetos</h2>
          <p className="text-muted-foreground mt-1">
            Defina as datas e responsáveis pelos projetos de implantação.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Projeto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente Vinculado</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(v) => setFormData((s) => ({ ...s, clientId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Analista Responsável</Label>
                <Select
                  value={formData.analystId}
                  onValueChange={(v) => setFormData((s) => ({ ...s, analystId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável..." />
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
              <div className="space-y-2">
                <Label>Início Estimado (Implantação)</Label>
                <Input
                  type="date"
                  value={formData.implStart}
                  onChange={(e) => setFormData((s) => ({ ...s, implStart: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Projeto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Nome do Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Início (Impl.)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((proj) => {
              const client = clients.find((c) => c.id === proj.clientId)
              const user = users.find((u) => u.id === proj.analystId)
              return (
                <TableRow key={proj.id} className="group">
                  <TableCell className="font-semibold">{proj.name}</TableCell>
                  <TableCell>
                    {client ? (
                      <Badge variant="secondary">{client.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user?.name || '-'}</TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {formatDate(proj.implStart)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteProject(proj.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Nenhum projeto cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
