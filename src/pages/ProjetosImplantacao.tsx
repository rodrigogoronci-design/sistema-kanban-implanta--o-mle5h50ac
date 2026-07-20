import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Workflow, Building2, Loader2, Eye, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import { useNavigate } from 'react-router-dom'
import {
  fetchProjetos,
  createProjeto,
  deleteProjeto,
  ProjetoImplantacao,
} from '@/services/projetos-implantacao'
import { fetchJornadas, Jornada } from '@/services/jornadas'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function ProjetosImplantacao() {
  const [projetos, setProjetos] = useState<ProjetoImplantacao[]>([])
  const [jornadas, setJornadas] = useState<Jornada[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [newJornada, setNewJornada] = useState('')
  const [newClient, setNewClient] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ProjetoImplantacao | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [p, j, cRes] = await Promise.all([
        fetchProjetos(),
        fetchJornadas(),
        (supabase as any).from('clients').select('id, name').order('name'),
      ])
      setProjetos(p)
      setJornadas(j)
      setClients(cRes.data || [])
    } catch (e: any) {
      toast.error('Erro ao carregar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = async () => {
    if (!newName.trim() || !newJornada) {
      toast.error('Preencha nome e jornada.')
      return
    }
    setSaving(true)
    try {
      await createProjeto(newName.trim(), newJornada, newClient || undefined)
      toast.success('Projeto criado com sucesso!')
      setCreateOpen(false)
      setNewName('')
      setNewJornada('')
      setNewClient('')
      loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProjeto(deleteTarget.id)
      toast.success('Projeto excluído com sucesso!')
      setDeleteTarget(null)
      setConfirmText('')
      loadData()
    } catch (e: any) {
      toast.error('Erro ao excluir: ' + e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Workflow className="w-6 h-6 text-primary" /> Projetos de Implantação
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe projetos de implantação baseados em jornadas.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="shrink-0"
          disabled={jornadas.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Projeto
        </Button>
      </div>

      {jornadas.length === 0 && (
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg text-sm text-amber-800">
          Nenhuma jornada cadastrada. Crie uma jornada primeiro na página de Jornadas.
        </div>
      )}

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : projetos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto de implantação.
                </TableCell>
              </TableRow>
            ) : (
              projetos.map((p) => {
                const client = clients.find((c) => c.id === p.client_id)
                return (
                  <TableRow
                    key={p.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/projetos-implantacao/${p.id}`)}
                  >
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {client ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {client.name}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === 'Concluído' ? 'default' : 'secondary'}
                        className={cn(
                          'font-normal',
                          p.status === 'Concluído' && 'bg-emerald-500/10 text-emerald-600',
                        )}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/projetos-implantacao/${p.id}`)
                          }}
                          title="Visualizar projeto"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(p)
                            setConfirmText('')
                          }}
                          title="Excluir projeto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Projeto de Implantação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Projeto *</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Implantação Cliente X"
              />
            </div>
            <div className="space-y-2">
              <Label>Jornada (Template) *</Label>
              <Select value={newJornada} onValueChange={setNewJornada}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma jornada" />
                </SelectTrigger>
                <SelectContent>
                  {jornadas.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={newClient || 'none'}
                onValueChange={(v) => setNewClient(v === 'none' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setConfirmText('')
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Esta ação não pode ser desfeita. O projeto{' '}
              <strong className="text-foreground">{deleteTarget?.name}</strong> e todas as suas
              atividades serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm font-medium">
              Para confirmar, digite o nome do projeto:{' '}
              <span className="text-destructive font-semibold">{deleteTarget?.name}</span>
            </Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteTarget?.name}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={confirmText !== deleteTarget?.name || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir Projeto'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
