import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'

export function ClientStatusManagementModal({
  open,
  onOpenChange,
  clientStatuses,
  clients,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  clientStatuses: any[]
  clients: any[]
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteData, setDeleteData] = useState<{ id: string; fallback: string } | null>(null)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!name) return
    try {
      if (editingId) {
        const { error } = await supabase
          .from('client_statuses')
          .update({ name, color })
          .eq('id', editingId)
        if (error) throw error
        setEditingId(null)
      } else {
        const id = `status-${Date.now()}`
        const { error } = await supabase.from('client_statuses').insert([{ id, name, color }])
        if (error) throw error
      }
      setName('')
      setColor('#3b82f6')
      onSuccess()
      toast({ title: 'Sucesso', description: 'Status salvo com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleEdit = (s: any) => {
    setEditingId(s.id)
    setName(s.name)
    setColor(s.color)
  }

  const handleDelete = (id: string) => {
    const inUse = clients.some((c) => c.status_id === id)
    if (inUse) {
      setDeleteData({ id, fallback: clientStatuses.find((x) => x.id !== id)?.id || '' })
    } else {
      executeDelete(id)
    }
  }

  const executeDelete = async (id: string, fallback?: string) => {
    try {
      if (fallback) {
        const { error: updateError } = await supabase
          .from('clients')
          .update({ status_id: fallback })
          .eq('status_id', id)
        if (updateError) throw updateError
      }
      const { error } = await supabase.from('client_statuses').delete().eq('id', id)
      if (error) throw error

      setDeleteData(null)
      onSuccess()
      toast({ title: 'Sucesso', description: 'Status excluído com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const confirmDelete = () => {
    if (deleteData) {
      executeDelete(deleteData.id, deleteData.fallback)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Status de Clientes</DialogTitle>
        </DialogHeader>

        {deleteData ? (
          <div className="space-y-4 pt-4">
            <DialogDescription className="text-destructive font-medium">
              Este status está em uso por clientes.
            </DialogDescription>
            <div className="space-y-2">
              <Label>Selecione um status substituto:</Label>
              <Select
                value={deleteData.fallback}
                onValueChange={(v) => setDeleteData((d) => (d ? { ...d, fallback: v } : null))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clientStatuses
                    .filter((s) => s.id !== deleteData.id)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => setDeleteData(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Confirmar Exclusão
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            <div className="flex gap-2 items-end">
              <div className="space-y-2 flex-1">
                <Label>Nome do Status</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Prospect"
                />
              </div>
              <div className="space-y-2 w-20">
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="p-1 h-9 cursor-pointer"
                />
              </div>
              <Button onClick={handleSave} disabled={!name}>
                {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
              {editingId && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null)
                    setName('')
                    setColor('#3b82f6')
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>

            <ScrollArea className="h-[250px] pr-4">
              <div className="space-y-2">
                {clientStatuses.map((status) => (
                  <div
                    key={status.id}
                    className="flex items-center justify-between p-2 border rounded-md group bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="font-medium text-sm">{status.name}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(status)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(status.id)}
                        disabled={clientStatuses.length <= 1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
