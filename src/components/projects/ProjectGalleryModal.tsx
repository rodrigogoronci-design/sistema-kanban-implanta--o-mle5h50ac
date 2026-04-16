import { useState, useMemo } from 'react'
import useMainStore, { Project, Attachment } from '@/stores/main'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, Download, FileText, Image as ImageIcon, File, Paperclip, Search } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Props {
  project?: Project
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectGalleryModal({ project, open, onOpenChange }: Props) {
  const { tasks } = useMainStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null)

  const projectTasks = useMemo(() => {
    if (!project) return []
    return tasks.filter((t) => t.projectId === project.id)
  }, [tasks, project])

  const attachments = useMemo(() => {
    let all = projectTasks.flatMap((t) =>
      (t.attachments || []).map((a) => ({
        ...a,
        taskTitle: t.title,
        taskId: t.id,
      })),
    )

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      all = all.filter((a) => a.name.toLowerCase().includes(q))
    }

    all.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })

    return all
  }, [projectTasks, searchTerm, sortOrder])

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Galeria do Projeto: {project?.name}</DialogTitle>
            <DialogDescription>
              Visualize todos os arquivos anexados às tarefas deste projeto.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do arquivo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={sortOrder} onValueChange={(v: 'desc' | 'asc') => setSortOrder(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Mais recentes</SelectItem>
                  <SelectItem value="asc">Mais antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border bg-card shadow-sm p-4 mt-4">
            {attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-max">
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
                        {isPreviewable(file.type) && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-full shadow-sm"
                            onClick={() => setPreviewFile(file)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full shadow-sm"
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
                      <p
                        className="text-sm font-medium leading-tight line-clamp-2"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <div className="mt-auto pt-1 flex flex-col gap-1.5 items-start">
                        <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(file.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 truncate max-w-full font-normal mt-1"
                          title={`Tarefa: ${file.taskTitle}`}
                        >
                          {file.taskTitle}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                <div className="p-4 bg-muted/30 rounded-full">
                  <Paperclip className="w-10 h-10 text-muted-foreground/50" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">Nenhum arquivo encontrado</p>
                  <p className="text-sm">
                    {searchTerm
                      ? 'Não há arquivos correspondentes à sua busca.'
                      : 'Este projeto ainda não possui arquivos anexados.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="sm:max-w-4xl w-[95vw] p-0 overflow-hidden bg-background border-none shadow-2xl z-[60]">
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
    </>
  )
}
