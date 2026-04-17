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
import { Plus, Trash2, Loader2, ShieldCheck, Pencil, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Users() {
  const [users, setUsers] = useState<any[]>([])
  const [sectors, setSectors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isCreatingSector, setIsCreatingSector] = useState(false)
  const [newSectorName, setNewSectorName] = useState('')
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Colaborador',
    setor_id: 'none',
    avatar_url: '',
  })

  const fetchData = async () => {
    const [usersRes, sectorsRes] = await Promise.all([
      supabase.from('colaboradores').select('*, setores(nome)').order('nome'),
      supabase.from('setores').select('*').order('nome'),
    ])

    if (usersRes.error) {
      toast({
        title: 'Erro ao carregar',
        description: usersRes.error.message,
        variant: 'destructive',
      })
    } else {
      setUsers(usersRes.data || [])
    }

    if (sectorsRes.data) {
      setSectors(sectorsRes.data)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'Colaborador',
      setor_id: 'none',
      avatar_url: '',
    })
    setIsEditing(false)
    setCurrentUserId(null)
    setIsCreatingSector(false)
    setNewSectorName('')
  }

  const handleEdit = (user: any) => {
    setFormData({
      name: user.nome || '',
      email: user.email || '',
      password: '',
      role: user.role || 'Colaborador',
      setor_id: user.setor_id || 'none',
      avatar_url: user.avatar_url || '',
    })
    setCurrentUserId(user.id)
    setIsEditing(true)
    setIsOpen(true)
    setIsCreatingSector(false)
  }

  const handleCreateSector = async () => {
    if (!newSectorName.trim()) return
    const { data, error } = await supabase
      .from('setores')
      .insert({ nome: newSectorName })
      .select()
      .single()
    if (error) {
      toast({ title: 'Erro ao criar setor', description: error.message, variant: 'destructive' })
    } else if (data) {
      setSectors([...sectors, data])
      setFormData((s) => ({ ...s, setor_id: data.id }))
      setIsCreatingSector(false)
      setNewSectorName('')
      toast({ title: 'Setor criado com sucesso' })
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

      setFormData((s) => ({ ...s, avatar_url: data.publicUrl }))
      toast({ title: 'Foto carregada com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro ao carregar foto', description: error.message, variant: 'destructive' })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const action = isEditing ? 'update' : 'create'
      const payload = isEditing ? { ...formData, id: currentUserId } : formData

      const { error } = await supabase.functions.invoke('manage-user', {
        body: { action, payload },
      })

      if (error) throw error

      toast({ title: isEditing ? 'Usuário atualizado com sucesso' : 'Usuário criado com sucesso' })
      setIsOpen(false)
      resetForm()
      fetchData()
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
      fetchData()
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
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="shrink-0" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" /> Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center justify-center space-y-4 mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback className="text-2xl">
                    {formData.name?.substring(0, 2).toUpperCase() || 'UP'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="avatar-upload"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {formData.avatar_url ? 'Trocar Foto' : 'Adicionar Foto'}
                  </Button>
                </div>
              </div>

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
                <Label>
                  {isEditing ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha Temporária'}
                </Label>
                <Input
                  type="password"
                  required={!isEditing}
                  value={formData.password}
                  onChange={(e) => setFormData((s) => ({ ...s, password: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Setor</Label>
                  <Select
                    value={formData.setor_id}
                    onValueChange={(v) => {
                      if (v === 'new') {
                        setIsCreatingSector(true)
                        setFormData((s) => ({ ...s, setor_id: 'none' }))
                      } else {
                        setFormData((s) => ({ ...s, setor_id: v }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um setor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum setor</SelectItem>
                      {sectors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome}
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="font-semibold text-primary">
                        + Criar novo setor
                      </SelectItem>
                    </SelectContent>
                  </Select>
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

              {isCreatingSector && (
                <div className="p-3 bg-muted/50 rounded-md space-y-3 border border-border/50">
                  <Label className="text-sm">Novo Setor</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Digite o nome..."
                      value={newSectorName}
                      onChange={(e) => setNewSectorName(e.target.value)}
                      autoFocus
                    />
                    <Button type="button" onClick={handleCreateSector}>
                      Salvar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreatingSector(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : isEditing ? (
                  'Atualizar Usuário'
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
              <TableHead>Setor</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead className="w-[100px]"></TableHead>
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
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>{user.nome?.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{user.setores?.nome || '-'}</TableCell>
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
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
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
