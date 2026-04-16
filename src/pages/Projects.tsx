import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Loader2, Briefcase } from 'lucide-react'

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    client_id: '',
    analyst_id: '',
  })

  const fetchData = async () => {
    const [pRes, cRes, uRes] = await Promise.all([
      supabase.from('projects').select('*, clients(name), colaboradores(nome)').order('name'),
      supabase.from('clients').select('id, name').order('name'),
      supabase.from('colaboradores').select('id, nome').order('nome'),
    ])

    if (pRes.error)
      toast({
        title: 'Erro ao carregar projetos',
        description: pRes.error.message,
        variant: 'destructive',
      })
    else setProjects(pRes.data || [])

    if (cRes.data) setClients(cRes.data)
    if (uRes.data) setUsers(uRes.data)

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('projects').insert([
        {
          name: formData.name,
          client_id: formData.client_id || null,
          analyst_id: formData.analyst_id || null,
        },
      ])
      if (error) throw error

      toast({ title: 'Projeto criado com sucesso' })
      setIsOpen(false)
      fetchData()
      setFormData({ name: '', client_id: '', analyst_id: '' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este projeto?')) return

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Projeto excluído' })
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground">Gerencie os projetos de implantação.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Projeto</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente Vinculado</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(v) => setFormData((s) => ({ ...s, client_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
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
                  value={formData.analyst_id}
                  onValueChange={(v) => setFormData((s) => ({ ...s, analyst_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Salvar Projeto'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome do Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Analista Responsável</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Carregando projetos...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      {project.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {project.clients?.name || '-'}
                  </TableCell>
                  <TableCell>{project.colaboradores?.nome || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
