import { useState, useEffect } from 'react'
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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Pencil, Search, Shield, Building, Users as UsersIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Colaborador {
  id: string
  nome: string
  email: string
  telefone: string | null
  departamento: string | null
  role: string
  image_gender: string | null
}

const SCREENS = [
  { path: '/', name: 'Área de Trabalho' },
  { path: '/clients', name: 'Clientes' },
  { path: '/projects', name: 'Projetos' },
  { path: '/users', name: 'Usuários' },
  { path: '/reports', name: 'Relatórios' },
]

const ROLES = ['Admin', 'Gerente', 'Colaborador']

export default function Users() {
  const { toast } = useToast()

  const [users, setUsers] = useState<Colaborador[]>([])
  const [setores, setSetores] = useState<string[]>([])
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({})

  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Modals state
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<Colaborador | undefined>(undefined)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const [sectorFormOpen, setSectorFormOpen] = useState(false)
  const [editingSectorIndex, setEditingSectorIndex] = useState<number | null>(null)
  const [sectorName, setSectorName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const { data: usersData } = await supabase.from('colaboradores').select('*').order('nome')
    setUsers(usersData || [])

    const { data: setoresData } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'setores')
      .single()
    if (setoresData) setSetores(setoresData.valor as string[])

    const { data: rolesData } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'role_permissions')
      .single()
    if (rolesData) setRolePermissions(rolesData.valor as Record<string, string[]>)

    setLoading(false)
  }

  // USER MANAGEMENT
  const [userFormData, setUserFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    departamento: '',
    role: 'Colaborador',
    password: '',
  })

  const openUserForm = (user?: Colaborador) => {
    setEditingUser(user)
    if (user) {
      setUserFormData({
        nome: user.nome,
        email: user.email || '',
        telefone: user.telefone || '',
        departamento: user.departamento || '',
        role: user.role,
        password: '',
      })
    } else {
      setUserFormData({
        nome: '',
        email: '',
        telefone: '',
        departamento: '',
        role: 'Colaborador',
        password: '',
      })
    }
    setUserFormOpen(true)
  }

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        action: editingUser ? 'update' : 'create',
        payload: {
          id: editingUser?.id,
          email: userFormData.email,
          name: userFormData.nome,
          role: userFormData.role,
          departamento: userFormData.departamento === 'none' ? null : userFormData.departamento,
          password: userFormData.password || undefined,
        },
      }

      const { data, error } = await supabase.functions.invoke('manage-user', { body: payload })
      if (error || data?.error) throw new Error(error?.message || data?.error)

      // Also update telefone
      if (editingUser || data?.id) {
        const targetId = editingUser ? editingUser.id : data.id
        await supabase
          .from('colaboradores')
          .update({ telefone: userFormData.telefone })
          .eq('id', targetId)
      }

      toast({ title: 'Sucesso', description: 'Usuário salvo com sucesso!' })
      setUserFormOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    try {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'delete', payload: { id: userToDelete } },
      })
      if (error || data?.error) throw new Error(error?.message || data?.error)

      toast({ title: 'Sucesso', description: 'Usuário removido com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setUserToDelete(null)
    }
  }

  // SECTOR MANAGEMENT
  const openSectorForm = (index: number | null = null) => {
    setEditingSectorIndex(index)
    setSectorName(index !== null ? setores[index] : '')
    setSectorFormOpen(true)
  }

  const handleSectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectorName.trim()) return

    let newSetores = [...setores]
    if (editingSectorIndex !== null) {
      newSetores[editingSectorIndex] = sectorName.trim()
    } else {
      if (newSetores.includes(sectorName.trim())) {
        toast({ title: 'Erro', description: 'Este setor já existe.', variant: 'destructive' })
        return
      }
      newSetores.push(sectorName.trim())
    }

    await supabase.from('configuracoes').upsert({ chave: 'setores', valor: newSetores })
    setSetores(newSetores)
    setSectorFormOpen(false)
    toast({ title: 'Sucesso', description: 'Setor salvo com sucesso!' })
  }

  const handleDeleteSector = async (index: number) => {
    const newSetores = setores.filter((_, i) => i !== index)
    await supabase.from('configuracoes').upsert({ chave: 'setores', valor: newSetores })
    setSetores(newSetores)
    toast({ title: 'Sucesso', description: 'Setor removido com sucesso!' })
  }

  // PERMISSIONS MANAGEMENT
  const togglePermission = async (role: string, path: string, checked: boolean) => {
    const currentPaths = rolePermissions[role] || []
    const newPaths = checked ? [...currentPaths, path] : currentPaths.filter((p) => p !== path)

    const newPermissions = { ...rolePermissions, [role]: newPaths }
    setRolePermissions(newPermissions)

    await supabase
      .from('configuracoes')
      .upsert({ chave: 'role_permissions', valor: newPermissions })
    toast({
      title: 'Permissões atualizadas',
      description: `Acessos do perfil ${role} atualizados.`,
    })
  }

  const filteredUsers = users.filter((u) =>
    u.nome.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Gestão de Equipe</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie usuários, setores e permissões de acesso.
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="users" className="flex gap-2">
            <UsersIcon className="w-4 h-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="sectors" className="flex gap-2">
            <Building className="w-4 h-4" /> Setores
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex gap-2">
            <Shield className="w-4 h-4" /> Acessos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 animate-fade-in-up">
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
            <Button onClick={() => openUserForm()}>
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[80px] text-center">Foto</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell className="flex justify-center">
                        <Avatar className="border-2 border-background shadow-sm">
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?seed=${user.nome}`}
                            className="object-cover"
                          />
                          <AvatarFallback>{user.nome.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{user.nome}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.departamento || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => openUserForm(user)}>
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setUserToDelete(user.id)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {!loading && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Setores Cadastrados</h3>
            <Button onClick={() => openSectorForm()} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Novo Setor
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {setores.map((setor, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm hover:border-primary/50 transition-colors"
              >
                <span className="font-medium">{setor}</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openSectorForm(idx)}
                    className="h-8 w-8"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSector(idx)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {setores.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground border rounded-xl bg-card border-dashed">
                Nenhum setor cadastrado.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6 animate-fade-in-up">
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium mb-1">Permissões de Telas</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Defina quais telas cada grupo de acesso pode visualizar.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ROLES.map((role) => (
                <div key={role} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Shield className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-base">{role}</h4>
                  </div>
                  <div className="space-y-4">
                    {SCREENS.map((screen) => {
                      const isAllowed = rolePermissions[role]?.includes(screen.path) || false
                      return (
                        <div
                          key={screen.path}
                          className="flex flex-row items-center justify-between"
                        >
                          <Label
                            className="cursor-pointer font-normal"
                            htmlFor={`${role}-${screen.path}`}
                          >
                            {screen.name}
                          </Label>
                          <Switch
                            id={`${role}-${screen.path}`}
                            checked={isAllowed}
                            onCheckedChange={(checked) =>
                              togglePermission(role, screen.path, checked)
                            }
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Form Modal */}
      <Dialog open={userFormOpen} onOpenChange={setUserFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUserSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                required
                value={userFormData.nome}
                onChange={(e) => setUserFormData({ ...userFormData, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                required
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label>Senha (Mínimo 6 caracteres)</Label>
                <Input
                  type="password"
                  required={!editingUser}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Perfil de Acesso</Label>
                <Select
                  value={userFormData.role}
                  onValueChange={(val) => setUserFormData({ ...userFormData, role: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select
                  value={userFormData.departamento}
                  onValueChange={(val) => setUserFormData({ ...userFormData, departamento: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="italic text-muted-foreground">
                      Nenhum
                    </SelectItem>
                    {setores.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setUserFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sector Form Modal */}
      <Dialog open={sectorFormOpen} onOpenChange={setSectorFormOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{editingSectorIndex !== null ? 'Editar Setor' : 'Novo Setor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSectorSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome do Setor</Label>
              <Input
                autoFocus
                required
                value={sectorName}
                onChange={(e) => setSectorName(e.target.value)}
                placeholder="Ex: Tecnologia"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSectorFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário perderá o acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
