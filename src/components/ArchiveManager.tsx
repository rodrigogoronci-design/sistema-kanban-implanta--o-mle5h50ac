import { useState } from 'react'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'
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
import { ArchiveRestore, Trash2, Archive } from 'lucide-react'

export default function ArchiveManager({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { columns, restoreColumn, deleteColumn } = useMainStore()
  const [deleteColId, setDeleteColId] = useState<string | null>(null)

  const archivedColumns = columns.filter((c) => c.archived)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Colunas Arquivadas
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2">
            {archivedColumns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <Archive className="w-8 h-8 opacity-20" />
                <p>Nenhuma coluna arquivada no momento.</p>
              </div>
            ) : (
              archivedColumns.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card shadow-sm"
                >
                  <span className="font-medium truncate mr-4">{col.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreColumn(col.id)}
                      title="Restaurar"
                    >
                      <ArchiveRestore className="w-4 h-4 mr-1" />
                      Restaurar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteColId(col.id)}
                      title="Excluir Permanentemente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteColId} onOpenChange={(open) => !open && setDeleteColId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A coluna será excluída permanentemente e as tarefas
              nela ficarão sem coluna visível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteColId) {
                  deleteColumn(deleteColId)
                  setDeleteColId(null)
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
