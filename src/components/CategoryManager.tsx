import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus } from 'lucide-react'
import { useState } from 'react'

export function CategoryManager({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { categories, addCategory, updateCategory, deleteCategory } = useMainStore()
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3b82f6')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Nova categoria"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCatName.trim()) {
                  addCategory({ name: newCatName.trim(), color: newCatColor })
                  setNewCatName('')
                }
              }}
            />
            <div className="relative w-12 h-10 shrink-0 rounded-md overflow-hidden border border-input">
              <input
                type="color"
                className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
              />
              <div
                className="w-full h-full pointer-events-none"
                style={{ backgroundColor: newCatColor }}
              />
            </div>
            <Button
              onClick={() => {
                if (newCatName.trim()) {
                  addCategory({ name: newCatName.trim(), color: newCatColor })
                  setNewCatName('')
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto px-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex gap-2 items-center">
                <Input
                  value={cat.name}
                  onChange={(e) => updateCategory(cat.id, { name: e.target.value })}
                />
                <div className="relative w-12 h-10 shrink-0 rounded-md overflow-hidden border border-input">
                  <input
                    type="color"
                    className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    value={cat.color}
                    onChange={(e) => updateCategory(cat.id, { color: e.target.value })}
                  />
                  <div
                    className="w-full h-full pointer-events-none"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                  size="icon"
                  onClick={() => deleteCategory(cat.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma categoria cadastrada.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
