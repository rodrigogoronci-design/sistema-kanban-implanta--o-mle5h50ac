import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, MailWarning, CheckCircle2, XCircle, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface RatEmailLog {
  id: string
  task_id: string
  sent_at: string
  recipient_email: string
  status: string
  error_message: string | null
  pdf_url: string | null
  task?: {
    title: string
    client?: {
      name: string
    }
  }
}

export default function Monitoramento() {
  const [logs, setLogs] = useState<RatEmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('rat_email_logs')
      .select(`
        *,
        task:tasks (
          title,
          client:clients (
            name
          )
        )
      `)
      .order('sent_at', { ascending: false })

    if (!error && data) {
      setLogs(data as any)
    }
    setLoading(false)
  }

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase()
    return (
      log.recipient_email?.toLowerCase().includes(term) ||
      log.task?.title?.toLowerCase().includes(term) ||
      log.task?.client?.name?.toLowerCase().includes(term)
    )
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Monitoramento RAT</h2>
          <p className="text-muted-foreground">
            Histórico de relatórios de atendimento técnico enviados aos clientes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Histórico de Envios</CardTitle>
              <CardDescription>Acompanhe o status de entrega dos e-mails enviados.</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, tarefa ou e-mail..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Cliente / Tarefa</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center text-muted-foreground">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                        Carregando histórico...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      <MailWarning className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      {searchTerm
                        ? 'Nenhum envio encontrado para sua busca.'
                        : 'Nenhum e-mail foi enviado ainda.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.sent_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {log.task?.client?.name || 'Cliente desconhecido'}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {log.task?.title || 'Tarefa desconhecida'}
                        </div>
                      </TableCell>
                      <TableCell>{log.recipient_email}</TableCell>
                      <TableCell>
                        {log.status === 'success' ? (
                          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Sucesso
                          </Badge>
                        ) : (
                          <Badge
                            variant="destructive"
                            title={log.error_message || 'Erro desconhecido'}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Falha
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {log.pdf_url ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={log.pdf_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Ver PDF
                            </a>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sem anexo</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
