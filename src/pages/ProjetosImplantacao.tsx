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
import {
  Plus,
  Workflow,
  Building2,
  Loader2,
  Eye,
  Trash2,
  Edit2,
  User,
  CalendarIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import { fetchProjetos, deleteProjeto, ProjetoImplantacao } from '@/services/projetos-implantacao'
import { fetchJornadas, Jornada } from '@/services/jornadas'
import { ProjetoFormModal } from '@/components/projetos-implantacao/ProjetoFormModal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const formatDate = (d: string | null) => {
  if (!d) return '-'
  const [y, m, day] = d.split('T')[0].split('-')
  return `${day}/${m}/${y}`
}

export default function ProjetosImplantacao() {
  const [projetos, setProjetos] = useState<ProjetoImplantacao[]>([])
  const [jornadas, setJornadas] = useState<Jornada[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [analysts, setAnalysts] = useState<{ id: string; nome: string }[]>([])
  const [etapas, setEtapas] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProjeto, setEditingProjeto] = useState<ProjetoImplantacao | null>(null)
  const navigate = useNavigate()
  const [deleteTarget, setDeleteTarget] = useState<ProjetoImplantacao | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [p, j, cRes, aRes, eRes] = await Promise.all([
        fetchProjetos(),
        fetchJornadas(),
        supabase.from('clients').select('id, name').order('name'),
        supabase.from('analistas').select('id, nome').eq('status', 'Ativo').order('nome'),
        supabase.from('jornada_etapas').select('id, name'),
      ])
      setProjetos(p)
      setJornadas(j)
      setClients(cRes.data || [])
      setAnalysts(aRes.data || [])
      const map: Record<string, string> = {}
      for (const e of eRes.data || []) map[e.id] = e.name
      setEtapas(map)
    } catch (e: any) {
      toast.error('Erro ao carregar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

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

  const getEtapaName = (p: ProjetoImplantacao) => {
    if (p.status === 'Concluído') return 'Concluído'
    return p.current_step_id ? etapas[p.current_step_id] || '-' : '-'
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
          onClick={() => {
            setEditingProjeto(null)
            setFormOpen(true)
          }}
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
              <TableHead>Etapa Atual</TableHead>
              <TableHead>Analista</TableHead>
              <TableHead>Data Demanda</TableHead>
              <TableHead className="w-[120px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : projetos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto de implantação.
                </TableCell>
              </TableRow>
            ) : (
              projetos.map((p) => {
                const client = clients.find((c) => c.id === p.client_id)
                const analyst = analysts.find((a) => a.id === p.analyst_id)
                const etapaName = getEtapaName(p)
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
                        {etapaName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {analyst ? (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {analyst.nome}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" /> {formatDate(p.data_demanda)}
                      </span>
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
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingProjeto(p)
                            setFormOpen(true)
                          }}
                          title="Editar projeto"
                        >
                          <Edit2 className="w-4 h-4" />
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

      <ProjetoFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        editingProjeto={editingProjeto}
        jornadas={jornadas}
        clients={clients}
        analysts={analysts}
        onSaved={loadData}
      />

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
