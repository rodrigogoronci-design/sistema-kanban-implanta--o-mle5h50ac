import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag as TagIcon, Plus, Check, X } from 'lucide-react'
import useMainStore from '@/stores/main'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface Props {
  tagIds: string[]
  onTagsChange: (newTagIds: string[]) => void
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b']

export function AttachmentTagPopover({ tagIds, onTagsChange }: Props) {
  const { attachmentTags, addAttachmentTag, deleteAttachmentTag } = useMainStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(COLORS[0])

  const toggleTag = (id: string) => {
    if (tagIds.includes(id)) {
      onTagsChange(tagIds.filter((t) => t !== id))
    } else {
      onTagsChange([...tagIds, id])
    }
  }

  const handleCreate = () => {
    if (!newTagName.trim()) return
    const id = addAttachmentTag({ name: newTagName.trim(), color: newTagColor })
    onTagsChange([...tagIds, id])
    setNewTagName('')
    setIsCreating(false)
  }

  const handleDeleteTag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteAttachmentTag(id)
    onTagsChange(tagIds.filter((t) => t !== id))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full shadow-sm bg-background/50 hover:bg-background/80 shrink-0"
          title="Gerenciar Tags"
        >
          <TagIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 z-[100]" align="end">
        {!isCreating ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Tags do Arquivo</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCreating(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-48 pr-2 -mr-2">
              <div className="space-y-1.5">
                {attachmentTags.map((tag) => {
                  const isSelected = tagIds.includes(tag.id)
                  return (
                    <div
                      key={tag.id}
                      className={cn(
                        'group flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted transition-colors',
                        isSelected && 'bg-muted/50',
                      )}
                      onClick={() => toggleTag(tag.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm truncate">{tag.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteTag(e, tag.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
                {attachmentTags.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Nenhuma tag criada.
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsCreating(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <h4 className="text-sm font-semibold">Nova Tag</h4>
            </div>
            <Input
              placeholder="Nome da tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="h-8 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreate()
                }
              }}
            />
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={cn(
                    'w-6 h-6 rounded-md cursor-pointer flex items-center justify-center border-2 transition-colors',
                    newTagColor === c ? 'border-foreground' : 'border-transparent',
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewTagColor(c)}
                >
                  {newTagColor === c && <Check className="h-3.5 w-3.5 text-white drop-shadow-md" />}
                </div>
              ))}
            </div>
            <Button
              className="w-full h-8 text-sm"
              onClick={handleCreate}
              disabled={!newTagName.trim()}
            >
              Criar e Atribuir
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
