import { useState, useMemo } from 'react'
import useMainStore, { Task, Attachment } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertCircle,
  Download,
  Eye,
  File,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Tag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { AttachmentTagPopover } from './AttachmentTagPopover'

interface Props {
  tasks: Task[]
  searchTerm: string
  onTaskClick: (taskId: string) => void
}

export default function GlobalAttachmentGallery({ tasks, searchTerm, onTaskClick }: Props) {
  const { updateTask, attachmentTags } = useMainStore()
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const attachments = useMemo(() => {
    let all = tasks.flatMap((t) =>
      (t.attachments || []).map((a) => ({
        ...a,
        taskTitle: t.title,
        taskId: t.id,
      })),
    )

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      all = all.filter(
        (a) => a.name.toLowerCase().includes(q) || a.taskTitle.toLowerCase().includes(q),
      )
    }

    if (selectedTags.length > 0) {
      all = all.filter((a) => a.tagIds && selectedTags.some((tagId) => a.tagIds!.includes(tagId)))
    }

    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [tasks, searchTerm, selectedTags])

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string, className = 'w-8 h-8') => {
    if (type.startsWith('image/')) return <ImageIcon className={`${className} text-blue-500`} />
    if (type.includes('pdf')) return <FileText className={`${className} text-red-500`} />
    return <File className={`${className} text-gray-500`} />
  }

  const isPreviewable = (type: string) => {
    return type.startsWith('image/') || type === 'application/pdf'
  }

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Tag className="w-4 h-4" />
              Filtrar Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {attachmentTags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-2 p-2 hover:bg-muted rounded-md cursor-pointer"
                >
                  <Checkbox
                    checked={selectedTags.includes(tag.id)}
                    onCheckedChange={(c) => {
                      if (c) setSelectedTags([...selectedTags, tag.id])
                      else setSelectedTags(selectedTags.filter((t) => t !== tag.id))
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm truncate">{tag.name}</span>
                  </div>
                </label>
              ))}
              {attachmentTags.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Nenhuma tag disponível.
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Alert className="bg-amber-50 text-amber-900 border-amber-200 py-2 shrink-0">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm">
          Arquivos e tags são armazenados em memória e serão perdidos ao recarregar a página.
          Conecte um backend para persistência.
        </AlertDescription>
      </Alert>

      <div className="flex-1 overflow-auto rounded-xl border bg-card shadow-sm p-4">
        {attachments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-max">
            {attachments.map((file) => (
              <Card
                key={file.id}
                className="overflow-hidden group flex flex-col hover:border-primary/50 transition-colors"
              >
                <div className="aspect-square bg-muted/30 relative flex items-center justify-center p-4 border-b">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  ) : (
                    getFileIcon(file.type, 'w-12 h-12')
                  )}

                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <AttachmentTagPopover
                      tagIds={file.tagIds || []}
                      onTagsChange={(newTags) => {
                        const task = tasks.find((t) => t.id === file.taskId)
                        if (task) {
                          updateTask(task.id, {
                            attachments: (task.attachments || []).map((a) =>
                              a.id === file.id ? { ...a, tagIds: newTags } : a,
                            ),
                          })
                        }
                      }}
                    />
                    {isPreviewable(file.type) && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full shadow-sm bg-background/50 hover:bg-background/80"
                        onClick={() => setPreviewFile(file)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 rounded-full shadow-sm bg-background/50 hover:bg-background/80"
                      asChild
                      title="Baixar"
                    >
                      <a href={file.url} download={file.name} target="_blank" rel="noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3 flex flex-col gap-1.5 flex-1">
                  <p className="text-sm font-medium leading-tight line-clamp-2" title={file.name}>
                    {file.name}
                  </p>

                  {file.tagIds && file.tagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {file.tagIds.map((tagId) => {
                        const tag = attachmentTags.find((t) => t.id === tagId)
                        if (!tag) return null
                        return (
                          <Badge
                            key={tagId}
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 font-medium"
                            style={{
                              backgroundColor: `${tag.color}15`,
                              color: tag.color,
                              borderColor: `${tag.color}30`,
                            }}
                          >
                            {tag.name}
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  <div className="mt-auto pt-1 flex flex-col gap-1 items-start">
                    <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-secondary/80 truncate max-w-full font-normal w-full flex justify-center bg-muted/50"
                      onClick={() => onTaskClick(file.taskId)}
                      title={`Ver tarefa: ${file.taskTitle}`}
                    >
                      {file.taskTitle}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3 animate-in zoom-in-95 duration-300">
            <div className="p-4 bg-muted/30 rounded-full">
              <Paperclip className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">Nenhum anexo encontrado</p>
              <p className="text-sm">Não há arquivos correspondentes aos filtros atuais.</p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-4xl w-[95vw] p-0 overflow-hidden bg-background border-none shadow-2xl">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="truncate pr-6 text-base font-semibold">
              {previewFile?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Visualização do arquivo {previewFile?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-2 flex items-center justify-center min-h-[50vh] max-h-[85vh] bg-muted/10 rounded-b-lg">
            {previewFile?.type.startsWith('image/') ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-[75vh] object-contain rounded-md drop-shadow-sm"
              />
            ) : previewFile?.type === 'application/pdf' ? (
              <iframe
                src={previewFile.url}
                title={previewFile.name}
                className="w-full h-[75vh] rounded-md border bg-background"
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
