import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { format, parseISO } from 'date-fns'

interface Module {
  id: string
  name: string
  created_at: string
}

export default function Settings() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  // Modals state
  const [createOpen, setCreateOpen] = useState(false)
  const [newModule, setNewModule] = useState('')

  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('modules').select('*').order('name')
    if (error) {
      toast.error('Não foi possível carregar os módulos.')
    } else {
      setModules(data || [])
    }
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newModule.trim()) return
    const { data, error } = await supabase
      .from('modules')
      .insert([{ name: newModule.trim() }])
      .select()
    if (error) {
      toast.error(error.message.includes('unique') ? 'Módulo já existe.' : 'Erro ao criar módulo.')
    } else if (data) {
      setModules([...modules, data[0]].sort((a, b) => a.name.localeCompare(b.name)))
      setNewModule('')
      setCreateOpen(false)
      toast.success('Módulo adicionado.')
    }
  }

  const handleUpdate = async () => {
    if (!editValue.trim() || !editingId) return
    const { error } = await supabase
      .from('modules')
      .update({ name: editValue.trim() })
      .eq('id', editingId)
    if (error) {
      toast.error(
        error.message.includes('unique') ? 'Módulo já existe.' : 'Erro ao atualizar módulo.',
      )
    } else {
      setModules(
        modules
          .map((m) => (m.id === editingId ? { ...m, name: editValue.trim() } : m))
          .sort((a, b) => a.name.localeCompare(b.name)),
      )
      setEditingId(null)
      setEditOpen(false)
      toast.success('Módulo atualizado.')
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const { error } = await supabase.from('modules').delete().eq('id', deletingId)
    if (error) {
      toast.error('Erro ao excluir módulo.')
    } else {
      setModules(modules.filter((m) => m.id !== deletingId))
      toast.success('Módulo excluído.')
    }
    setDeletingId(null)
  }

  const openEdit = (mod: Module) => {
    setEditingId(mod.id)
    setEditValue(mod.name)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações e cadastros do sistema.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle>Módulos de Treinamento</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Gerencie a lista de módulos que podem ser selecionados nas tarefas de treinamento.
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Novo Módulo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md bg-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Carregando módulos...
              </div>
            ) : modules.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Nenhum módulo cadastrado.
              </div>
            ) : (
              <div className="w-full overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b text-muted-foreground">
                    <tr>
                      <th className="font-medium p-4">Nome do Módulo</th>
                      <th className="font-medium p-4 w-40">Data de Criação</th>
                      <th className="font-medium p-4 w-24 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {modules.map((mod) => (
                      <tr key={mod.id} className="hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium text-foreground">{mod.name}</td>
                        <td className="p-4 text-muted-foreground">
                          {mod.created_at ? format(parseISO(mod.created_at), 'dd/MM/yyyy') : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => openEdit(mod)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeletingId(mod.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Módulo</DialogTitle>
            <DialogDescription>
              Adicione um novo módulo de treinamento para ficar disponível nas tarefas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module-name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="module-name"
                placeholder="Ex: Financeiro"
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={!newModule.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription>Altere o nome do módulo de treinamento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-module-name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-module-name"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={
                !editValue.trim() ||
                editValue.trim() === modules.find((m) => m.id === editingId)?.name
              }
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita. Tarefas
              existentes que já usam este módulo não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
