import useMainStore, { Task, Attachment } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AttachmentTagPopover } from './AttachmentTagPopover'
import {
  Paperclip,
  Trash2,
  Download,
  AlertCircle,
  File,
  Image as ImageIcon,
  FileText,
  Eye,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface Props {
  task: Task
  onUpdate: (payload: Partial<Task>) => void
}

export function TaskAttachments({ task, onUpdate }: Props) {
  const { attachmentTags } = useMainStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const processFiles = async (files: FileList | File[]) => {
    if (files && files.length > 0) {
      setIsUploading(true)
      const newAttachments: Attachment[] = []

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `${task.id}/${fileName}`

        const { error } = await supabase.storage.from('attachments').upload(filePath, file)

        if (error) {
          console.error('Error uploading file:', error)
          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('attachments').getPublicUrl(filePath)

        newAttachments.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: publicUrl,
          createdAt: new Date().toISOString(),
        })
      }

      if (newAttachments.length > 0) {
        onUpdate({
          attachments: [...(task.attachments || []), ...newAttachments],
        })
      }
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleDelete = async (attachment: Attachment) => {
    if (attachment.url.includes('supabase.co')) {
      const pathParts = attachment.url.split('/attachments/')
      if (pathParts.length > 1) {
        const filePath = pathParts[1]
        await supabase.storage.from('attachments').remove([filePath])
      }
    }

    onUpdate({
      attachments: (task.attachments || []).filter((a) => a.id !== attachment.id),
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-500" />
    if (type.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />
    return <File className="w-4 h-4 text-gray-500" />
  }

  const isPreviewable = (type: string) => {
    return type.startsWith('image/') || type === 'application/pdf'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Anexos
          {isUploading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground ml-2" />}
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Enviando...' : 'Adicionar Arquivo'}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative transition-colors rounded-lg',
          isDragging && (task.attachments || []).length > 0
            ? 'ring-2 ring-primary ring-inset overflow-hidden'
            : '',
          isUploading && 'opacity-70 pointer-events-none',
        )}
      >
        {(task.attachments || []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {task.attachments!.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-2 border rounded-md bg-muted/30 group relative"
              >
                <div className="shrink-0 bg-background p-2 rounded shadow-sm">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0 pr-24">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                    {file.tagIds && file.tagIds.length > 0 && (
                      <div className="flex gap-1 overflow-x-auto scrollbar-none max-w-[150px]">
                        {file.tagIds.map((tagId) => {
                          const tag = attachmentTags.find((t) => t.id === tagId)
                          if (!tag) return null
                          return (
                            <Badge
                              key={tagId}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 font-medium shrink-0"
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
                  </div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/30 pl-2 backdrop-blur-sm rounded-l">
                  <div className="mr-1">
                    <AttachmentTagPopover
                      tagIds={file.tagIds || []}
                      onTagsChange={(newTags) => {
                        onUpdate({
                          attachments: (task.attachments || []).map((a) =>
                            a.id === file.id ? { ...a, tagIds: newTags } : a,
                          ),
                        })
                      }}
                    />
                  </div>
                  {isPreviewable(file.type) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPreviewFile(file)}
                      title="Visualizar"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="sr-only">Visualizar anexo</span>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Baixar">
                    <a href={file.url} download={file.name} target="_blank" rel="noreferrer">
                      <Download className="h-3.5 w-3.5" />
                      <span className="sr-only">Baixar anexo</span>
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={cn(
              'text-center py-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/10 hover:bg-muted/30',
            )}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div className="p-3 bg-secondary rounded-full">
                {isUploading ? (
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                ) : (
                  <Paperclip className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isUploading
                    ? 'Enviando arquivos...'
                    : 'Clique para fazer upload ou arraste arquivos'}
                </p>
                <p className="text-xs text-muted-foreground">PDF, DOCX, Imagens, etc.</p>
              </div>
            </div>
          </div>
        )}

        {isDragging && (task.attachments || []).length > 0 && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm border-2 border-primary border-dashed rounded-lg flex items-center justify-center pointer-events-none">
            <p className="text-primary font-medium text-lg flex items-center gap-2">
              <Download className="w-5 h-5" />
              Solte os arquivos aqui
            </p>
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
