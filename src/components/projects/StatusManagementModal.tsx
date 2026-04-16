import { useState } from 'react'
import useMainStore, { ProjectStatus } from '@/stores/main'
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

export function StatusManagementModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const store = useMainStore()
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteData, setDeleteData] = useState<{ id: string; fallback: string } | null>(null)

  const handleSave = () => {
    if (!name) return
    if (editingId) {
      store.updateProjectStatus(editingId, { name, color })
      setEditingId(null)
    } else {
      store.addProjectStatus({ name, color })
    }
    setName('')
    setColor('#3b82f6')
  }

  const handleEdit = (s: ProjectStatus) => {
    setEditingId(s.id)
    setName(s.name)
    setColor(s.color)
  }

  const handleDelete = (id: string) => {
    const inUse = store.projects.some((p) => p.statusId === id)
    if (inUse) {
      setDeleteData({ id, fallback: store.projectStatuses.find((x) => x.id !== id)?.id || '' })
    } else {
      store.deleteProjectStatus(id)
    }
  }

  const confirmDelete = () => {
    if (deleteData) {
      store.deleteProjectStatus(deleteData.id, deleteData.fallback)
      setDeleteData(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Status</DialogTitle>
        </DialogHeader>

        {deleteData ? (
          <div className="space-y-4 pt-4">
            <DialogDescription className="text-destructive font-medium">
              Este status está em uso por projetos.
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
                  {store.projectStatuses
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
                  placeholder="Ex: Em andamento"
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
                {store.projectStatuses.map((status) => (
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
                        disabled={store.projectStatuses.length <= 1}
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
