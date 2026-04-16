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
import { Plus, Trash2, Loader2, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Colaborador',
    departamento: '',
  })

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('colaboradores').select('*').order('nome')
    if (error) {
      toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' })
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'create', payload: formData },
      })

      if (error) throw error

      toast({ title: 'Usuário criado com sucesso' })
      setIsOpen(false)
      fetchUsers()
      setFormData({ name: '', email: '', password: '', role: 'Colaborador', departamento: '' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return

    try {
      const { error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'delete', payload: { id } },
      })
      if (error) throw error
      toast({ title: 'Usuário excluído' })
      fetchUsers()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">Gerencie o acesso e os perfis da equipe.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Senha Temporária</Label>
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData((s) => ({ ...s, password: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Input
                    value={formData.departamento}
                    onChange={(e) => setFormData((s) => ({ ...s, departamento: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Perfil de Acesso</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) => setFormData((s) => ({ ...s, role: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Administrador">Administrador</SelectItem>
                      <SelectItem value="Colaborador">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Salvar Usuário'
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
              <TableHead>E-mail</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando usuários...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário cadastrado no sistema.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{user.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{user.departamento || '-'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'Administrador' ? 'default' : 'secondary'}
                      className="gap-1"
                    >
                      {user.role === 'Administrador' && <ShieldCheck className="w-3 h-3" />}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user.id)}
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
