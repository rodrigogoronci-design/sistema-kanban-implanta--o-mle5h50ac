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
import { Plus, Trash2, Edit2, Loader2, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Analysts() {
  const [analysts, setAnalysts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    especialidade: '',
    user_id: 'none',
    status: 'Ativo',
  })

  const fetchData = async () => {
    const [analystsRes, usersRes] = await Promise.all([
      supabase.from('analistas').select('*, colaboradores(nome)').order('nome'),
      supabase.from('colaboradores').select('id, nome').order('nome'),
    ])

    if (analystsRes.error) {
      toast({
        title: 'Erro ao carregar analistas',
        description: analystsRes.error.message,
        variant: 'destructive',
      })
    } else {
      setAnalysts(analystsRes.data || [])
    }

    if (usersRes.data) {
      setUsers(usersRes.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenNew = () => {
    setEditingId(null)
    setFormData({ nome: '', especialidade: '', user_id: 'none', status: 'Ativo' })
    setIsOpen(true)
  }

  const handleEdit = (analyst: any) => {
    setEditingId(analyst.id)
    setFormData({
      nome: analyst.nome,
      especialidade: analyst.especialidade || '',
      user_id: analyst.user_id || 'none',
      status: analyst.status || 'Ativo',
    })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        nome: formData.nome,
        especialidade: formData.especialidade,
        user_id: formData.user_id === 'none' ? null : formData.user_id,
        status: formData.status,
      }

      if (editingId) {
        const { error } = await supabase.from('analistas').update(payload).eq('id', editingId)
        if (error) throw error
        toast({ title: 'Analista atualizado com sucesso' })
      } else {
        const { error } = await supabase.from('analistas').insert([payload])
        if (error) throw error
        toast({ title: 'Analista criado com sucesso' })
      }

      setIsOpen(false)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente excluir este analista? Isso pode afetar projetos e tarefas vinculadas.',
      )
    )
      return

    try {
      const { error } = await supabase.from('analistas').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Analista excluído' })
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analistas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o cadastro de analistas e seus vínculos.
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0" onClick={handleOpenNew}>
              <Plus className="w-4 h-4 mr-2" /> Novo Analista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Analista' : 'Criar Novo Analista'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData((s) => ({ ...s, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Especialidade</Label>
                <Input
                  value={formData.especialidade}
                  onChange={(e) => setFormData((s) => ({ ...s, especialidade: e.target.value }))}
                  placeholder="Ex: Implantação de Sistemas"
                />
              </div>
              <div className="space-y-2">
                <Label>Usuário Vinculado (Opcional)</Label>
                <Select
                  value={formData.user_id}
                  onValueChange={(v) => setFormData((s) => ({ ...s, user_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum usuário vinculado</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Vincular a um usuário permite associar as ações do sistema diretamente a ele.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData((s) => ({ ...s, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Salvar Analista'
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
              <TableHead>Nome</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Usuário Vinculado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando analistas...
                </TableCell>
              </TableRow>
            ) : analysts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum analista cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              analysts.map((analyst) => (
                <TableRow key={analyst.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      {analyst.nome}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {analyst.especialidade || '-'}
                  </TableCell>
                  <TableCell>{analyst.colaboradores?.nome || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={analyst.status === 'Ativo' ? 'default' : 'secondary'}
                      className="font-normal"
                    >
                      {analyst.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(analyst)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(analyst.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
