import { useState, useMemo } from 'react'
import useMainStore, { User } from '@/stores/main'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Pencil, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Users() {
  const { users, addUser, updateUser, deleteUser } = useMainStore()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', avatar: '' })
  const [editFormData, setEditFormData] = useState<User>({
    id: '',
    name: '',
    email: '',
    phone: '',
    avatar: '',
  })

  const filteredUsers = useMemo(() => {
    return users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [users, searchQuery])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    addUser({
      id: Math.random().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar || `https://img.usecurling.com/ppl/thumbnail?seed=${formData.name}`,
    })
    setFormData({ name: '', email: '', phone: '', avatar: '' })
    setOpen(false)
    toast({ title: 'Sucesso', description: 'Usuário cadastrado com sucesso!' })
  }

  const handleEditClick = (user: User) => {
    setEditFormData(user)
    setEditOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editFormData.name || !editFormData.email) return

    updateUser(editFormData.id, {
      name: editFormData.name,
      email: editFormData.email,
      phone: editFormData.phone,
      avatar: editFormData.avatar,
    })
    setEditOpen(false)
    toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso!' })
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Usuários</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os colaboradores da equipe de implantação.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">URL da Foto</Label>
                <Input
                  id="avatar"
                  placeholder="Deixe em branco para gerar automaticamente"
                  value={formData.avatar}
                  onChange={(e) => setFormData((s) => ({ ...s, avatar: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Usuário
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[80px] text-center">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="group">
                <TableCell className="flex justify-center">
                  <Avatar className="border-2 border-background shadow-sm">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-semibold">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{user.phone || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => handleEditClick(user)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  {users.length === 0 ? 'Nenhum usuário cadastrado.' : 'Nenhum usuário encontrado.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome Completo</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData((s) => ({ ...s, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail</Label>
              <Input
                id="edit-email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData((s) => ({ ...s, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData((s) => ({ ...s, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-avatar">URL da Foto</Label>
              <Input
                id="edit-avatar"
                value={editFormData.avatar}
                onChange={(e) => setEditFormData((s) => ({ ...s, avatar: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full">
              Atualizar Usuário
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
