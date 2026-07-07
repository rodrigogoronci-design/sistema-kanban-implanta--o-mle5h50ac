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
import { Plus, Edit2, Trash2, Route, Building2 } from 'lucide-react'
import { JornadaFormModal } from '@/components/jornadas/JornadaFormModal'
import { fetchJornadas, deleteJornada, Jornada } from '@/services/jornadas'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function Jornadas() {
  const [jornadas, setJornadas] = useState<Jornada[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [j, cRes] = await Promise.all([
        fetchJornadas(),
        (supabase as any).from('clients').select('id, name').order('name'),
      ])
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

  const handleCreate = () => {
    setEditingId(null)
    setModalOpen(true)
  }
  const handleEdit = (id: string) => {
    setEditingId(id)
    setModalOpen(true)
  }
  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta jornada?')) return
    try {
      await deleteJornada(id)
      toast.success('Jornada excluída!')
      loadData()
    } catch (e: any) {
      toast.error('Erro: ' + e.message)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Route className="w-6 h-6 text-primary" /> Jornadas
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie templates de fluxos de implantação.
          </p>
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Nova Jornada
        </Button>
      </div>
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : jornadas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Nenhuma jornada cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              jornadas.map((j) => {
                const client = clients.find((c) => c.id === j.client_id)
                return (
                  <TableRow key={j.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{j.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                      {j.description || '-'}
                    </TableCell>
                    <TableCell>
                      {client ? (
                        <Badge variant="secondary" className="font-normal">
                          <Building2 className="w-3 h-3 mr-1" /> {client.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(j.id)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(j.id)}
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
      <JornadaFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        jornadaId={editingId}
        clients={clients}
        onSaved={loadData}
      />
    </div>
  )
}
