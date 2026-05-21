import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Edit2, Trash2, Check, X, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

interface Module {
  id: string
  name: string
}

export default function Settings() {
  const [modules, setModules] = useState<Module[]>([])
  const [newModule, setNewModule] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações e cadastros do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle>Módulos de Treinamento</CardTitle>
          </div>
          <CardDescription>
            Gerencie a lista de módulos que podem ser selecionados nas tarefas de treinamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-end gap-4 max-w-md">
            <div className="space-y-2 flex-1 w-full">
              <Label>Novo Módulo</Label>
              <Input
                placeholder="Nome do módulo..."
                value={newModule}
                onChange={(e) => setNewModule(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>

          <div className="border rounded-md divide-y bg-card">
            {loading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Carregando módulos...
              </div>
            ) : modules.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Nenhum módulo cadastrado.
              </div>
            ) : (
              modules.map((mod) => (
                <div
                  key={mod.id}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
                >
                  {editingId === mod.id ? (
                    <div className="flex items-center gap-2 flex-1 w-full max-w-md">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdate()
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        autoFocus
                        className="h-9"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                        onClick={handleUpdate}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium truncate">{mod.name}</span>
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => {
                            setEditingId(mod.id)
                            setEditValue(mod.name)
                          }}
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
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
