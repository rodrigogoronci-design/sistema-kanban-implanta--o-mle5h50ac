import { useState, useMemo, useEffect } from 'react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Pencil, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

function UserFormModal({
  open,
  onOpenChange,
  user,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User
  onSubmit: (data: Omit<User, 'id'>) => void
}) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', avatar: '' })
  const [emailError, setEmailError] = useState('')

  useEffect(() => {
    if (open) {
      setFormData(
        user
          ? { name: user.name, email: user.email, phone: user.phone, avatar: user.avatar }
          : { name: '', email: '', phone: '', avatar: '' },
      )
      setEmailError('')
    }
  }, [open, user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailError('Please enter a valid email address')
      return
    }
    onSubmit(formData)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((s) => ({ ...s, avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Cadastrar Usuário'}</DialogTitle>
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
              onChange={(e) => {
                setFormData((s) => ({ ...s, email: e.target.value }))
                setEmailError('')
              }}
              required
            />
            {emailError && <p className="text-sm font-medium text-destructive">{emailError}</p>}
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
            <Label htmlFor="avatar">Foto</Label>
            {formData.avatar && (
              <div className="flex mb-3">
                <Avatar className="w-16 h-16 border-2 border-background shadow-sm">
                  <AvatarImage src={formData.avatar} className="object-cover" />
                  <AvatarFallback>{formData.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>
            )}
            <Input id="avatar" type="file" accept="image/*" onChange={handlePhotoChange} />
          </div>
          <Button type="submit" className="w-full">
            {user ? 'Atualizar' : 'Salvar'} Usuário
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Users() {
  const { users, addUser, updateUser, deleteUser } = useMainStore()
  const { toast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = useMemo(() => {
    return users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [users, searchQuery])

  const handleFormSubmit = (data: Omit<User, 'id'>) => {
    if (editingUser) {
      updateUser(editingUser.id, data)
      toast({ title: 'Sucesso', description: 'Usuário atualizado com sucesso!' })
    } else {
      addUser({
        id: Math.random().toString(),
        ...data,
        avatar: data.avatar || `https://img.usecurling.com/ppl/thumbnail?seed=${data.name}`,
      })
      toast({ title: 'Sucesso', description: 'Usuário cadastrado com sucesso!' })
    }
    setFormOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete)
      toast({ title: 'Sucesso', description: 'Usuário removido.' })
    }
    setUserToDelete(null)
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
        <Button
          onClick={() => {
            setEditingUser(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
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
                    <AvatarImage src={user.avatar} className="object-cover" />
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
                      onClick={() => {
                        setEditingUser(user)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setUserToDelete(user.id)}
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
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <UserFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
