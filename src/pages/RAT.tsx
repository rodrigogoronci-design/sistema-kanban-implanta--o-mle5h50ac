import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { formatHoursAndMinutes, getTaskHours } from '@/lib/time'
import { Printer, Mail, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import logoImg from '@/assets/logo-sl-143a4.png'

export default function RAT() {
  const { taskId } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (!taskId) return

      const { data: taskData } = await supabase
        .from('tasks')
        .select(`
          *,
          client:clients(*),
          category:categories(*),
          project:projects(*),
          time_entries(*)
        `)
        .eq('id', taskId)
        .single()

      if (!taskData) {
        setLoading(false)
        return
      }

      const { data: ta } = await supabase
        .from('task_analysts')
        .select('analistas(*)')
        .eq('task_id', taskId)

      let analysts = []
      if (ta && ta.length > 0) {
        analysts = ta.map((t: any) => t.analistas).filter(Boolean)
      } else if (taskData.responsible_id) {
        const { data: a } = await supabase
          .from('analistas')
          .select('*')
          .eq('id', taskData.responsible_id)
          .single()
        if (a) analysts.push(a)
      }

      let contacts = []
      if (taskData.client_id) {
        const { data: c } = await supabase
          .from('client_contacts')
          .select('*')
          .eq('client_id', taskData.client_id)
        if (c) contacts = c
      }

      setData({ task: taskData, analysts, contacts })
      setLoading(false)
    }
    loadData()
  }, [taskId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Gerando relatório...
      </div>
    )
  }

  if (!data?.task) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Tarefa não encontrada.
      </div>
    )
  }

  const { task, analysts, contacts } = data
  const totalHours = getTaskHours({ time_entries: task.time_entries })
  const participants = Array.isArray(task.participants) ? task.participants : []
  const trainedModules = Array.isArray(task.trained_modules) ? task.trained_modules : []

  const handleSendEmail = async () => {
    setIsSending(true)
    try {
      const content = document.getElementById('rat-content')
      if (!content) throw new Error('Conteúdo não encontrado')

      const htmlString = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>RAT - ${task.title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              .print\\:hidden { display: none !important; }
            }
          </style>
        </head>
        <body class="bg-white">
          <div class="max-w-4xl mx-auto p-8 text-black">
            ${content.outerHTML}
          </div>
        </body>
        </html>
      `
      const blob = new Blob([htmlString], { type: 'text/html' })
      const fileName = `RAT_${task.id}_${Date.now()}.html`
      const filePath = `${task.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, blob, { contentType: 'text/html' })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('attachments').getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl

      const attachmentId = crypto.randomUUID()
      const { error: dbError } = await supabase.from('attachments').insert({
        id: attachmentId,
        task_id: task.id,
        name: `RAT - ${task.title}.html`,
        size: blob.size,
        type: 'text/html',
        url: publicUrl,
      })

      if (dbError) throw dbError

      const { error: fnError } = await supabase.functions.invoke('send-rat-email', {
        body: {
          to: emailTo,
          subject: emailSubject,
          body: emailBody,
          attachmentUrl: publicUrl,
          attachmentName: `RAT - ${task.title}.html`,
        },
      })

      if (fnError) throw fnError

      toast.success('RAT enviado e salvo nos anexos com sucesso.')
      setEmailModalOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Falha ao enviar o RAT.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="print:hidden p-4 bg-muted border-b flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Visualização de Impressão</p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEmailSubject(`Relatório de Atendimento Técnico - ${task.title}`)
              setEmailBody(
                `Olá,\n\nSegue em anexo o Relatório de Atendimento Técnico referente à atividade "${task.title}".\n\nAtenciosamente,\nEquipe`,
              )
              if (contacts && contacts.length > 0) {
                setEmailTo(
                  contacts
                    .filter((c: any) => c.email)
                    .map((c: any) => c.email)
                    .join(', '),
                )
              }
              setEmailModalOpen(true)
            }}
          >
            <Mail className="w-4 h-4 mr-2" /> Enviar por Email
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir RAT
          </Button>
        </div>
      </div>

      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar RAT por Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Destinatário(s)</Label>
              <div className="flex flex-col gap-2">
                {contacts && contacts.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {contacts.map((c: any) =>
                      c.email ? (
                        <Badge
                          key={c.id}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => {
                            const currentEmails = emailTo
                              .split(',')
                              .map((e) => e.trim())
                              .filter(Boolean)
                            if (!currentEmails.includes(c.email)) {
                              setEmailTo(
                                currentEmails.length > 0 ? `${emailTo}, ${c.email}` : c.email,
                              )
                            }
                          }}
                        >
                          {c.name}
                        </Badge>
                      ) : null,
                    )}
                  </div>
                )}
                <Input
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="email@cliente.com.br"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea rows={5} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailModalOpen(false)} disabled={isSending}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="max-w-4xl mx-auto p-8 text-black flex-1 w-full" id="rat-content">
        <table className="w-full">
          <thead className="table-header-group">
            <tr>
              <td className="pb-4 print:pb-2">
                <div className="border-b-2 border-slate-800 pb-4 mb-4 print:pb-2 print:mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div className="flex items-center gap-6">
                    <img
                      src={logoImg}
                      alt="Logo Service Logic"
                      className="h-14 object-contain print:h-10"
                    />
                    <div>
                      <h1 className="text-xl font-bold uppercase tracking-wider text-slate-800 print:text-lg">
                        Relatório de Atendimento Técnico
                      </h1>
                      <p className="text-slate-500 mt-1 print:mt-0 print:text-sm">
                        Ref: {task.title}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-slate-600">
                      Data de Emissão: {format(new Date(), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 print:p-3 border border-slate-200 rounded-lg">
                  <h2 className="text-sm font-bold text-slate-800 uppercase mb-3 print:mb-2 border-b border-slate-200 pb-2 print:pb-1">
                    Dados do Cliente
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:gap-2 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 print:mb-0">
                        Razão Social / Nome
                      </p>
                      <p className="font-medium text-base">
                        {task.client?.name || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 print:mb-0">
                        CNPJ
                      </p>
                      <p className="font-medium text-base">
                        {task.client?.cnpj || 'Não informado'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 print:mb-0">
                        Projeto
                      </p>
                      <p className="font-medium text-base">
                        {task.project?.name || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="space-y-6 print:space-y-4">
                  <section>
                    <h2 className="text-lg font-bold bg-slate-100 p-2 print:py-1 print:px-2 mb-3 print:mb-2 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
                      Detalhamento das Atividades
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 print:gap-2 text-sm bg-slate-50 p-4 print:p-3 rounded-lg border border-slate-100">
                      <div className="col-span-2 sm:col-span-4">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 print:mb-0">
                          Profissional(is)
                        </p>
                        <p className="font-medium">
                          {analysts.length > 0
                            ? analysts.map((a: any) => a.nome).join(', ')
                            : 'Não informado'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 print:mb-0">
                          Categoria
                        </p>
                        <p className="font-medium">{task.category?.name || 'Não informada'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 print:mb-0">
                          Início
                        </p>
                        <p className="font-medium">
                          {task.start_date
                            ? format(parseISO(task.start_date), 'dd/MM/yyyy HH:mm')
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1 print:mb-0">
                          Conclusão
                        </p>
                        <p className="font-medium">
                          {task.completion_date
                            ? format(parseISO(task.completion_date), 'dd/MM/yyyy HH:mm')
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h2 className="text-lg font-bold bg-slate-100 p-2 print:py-1 print:px-2 mb-3 print:mb-2 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
                      Participantes Presentes
                    </h2>
                    {participants.length > 0 ? (
                      <div className="border border-slate-200 rounded p-4 print:p-3">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {participants.map((p: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0" />
                              <span className="text-slate-700">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic p-4 print:p-3 border border-slate-200 border-dashed rounded">
                        Nenhum participante registrado.
                      </p>
                    )}
                  </section>

                  <section>
                    <h2 className="text-lg font-bold bg-slate-100 p-2 print:py-1 print:px-2 mb-3 print:mb-2 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
                      Conteúdo / Módulos
                    </h2>
                    {trainedModules.length > 0 ? (
                      <div className="border border-slate-200 rounded p-4 print:p-3">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {trainedModules.map((m: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0" />
                              <span className="text-slate-700">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic p-4 print:p-3 border border-slate-200 border-dashed rounded">
                        Nenhum módulo registrado.
                      </p>
                    )}
                  </section>

                  <section>
                    <h2 className="text-lg font-bold bg-slate-100 p-2 print:py-1 print:px-2 mb-3 print:mb-2 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
                      Apontamento de Horas
                    </h2>
                    <div className="bg-white rounded border border-slate-200 overflow-hidden text-sm">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase">
                          <tr>
                            <th className="px-4 py-2 font-medium">Data</th>
                            <th className="px-4 py-2 font-medium">Início</th>
                            <th className="px-4 py-2 font-medium">Término</th>
                            <th className="px-4 py-2 font-medium">Observação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {task.time_entries && task.time_entries.length > 0 ? (
                            [...task.time_entries]
                              .sort(
                                (a, b) =>
                                  new Date(a.start_time).getTime() -
                                  new Date(b.start_time).getTime(),
                              )
                              .map((entry: any) => (
                                <tr key={entry.id}>
                                  <td className="px-4 py-2">
                                    {format(parseISO(entry.start_time), 'dd/MM/yyyy')}
                                  </td>
                                  <td className="px-4 py-2">
                                    {format(parseISO(entry.start_time), 'HH:mm')}
                                  </td>
                                  <td className="px-4 py-2">
                                    {entry.end_time
                                      ? format(parseISO(entry.end_time), 'HH:mm')
                                      : '-'}
                                  </td>
                                  <td className="px-4 py-2 text-slate-600">
                                    {entry.observation || '-'}
                                  </td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-4 text-center text-slate-500 italic"
                              >
                                Nenhum apontamento de horas registrado.
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="bg-slate-50 border-t border-slate-200">
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 py-2 text-right font-bold text-slate-700 uppercase text-xs"
                            >
                              Duração Total:
                            </td>
                            <td className="px-4 py-2 font-bold text-slate-800">
                              {formatHoursAndMinutes(totalHours)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </section>

                  {((task.recording_url && task.recording_url.trim() !== '') ||
                    (task.recordingUrl && task.recordingUrl.trim() !== '')) && (
                    <section>
                      <h2 className="text-lg font-bold bg-slate-100 p-2 print:py-1 print:px-2 mb-3 print:mb-2 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
                        Gravação de Treinamento
                      </h2>
                      <div className="bg-white p-4 print:p-3 rounded border border-slate-200 text-sm flex flex-col gap-2 print:gap-1">
                        <a
                          href={task.recording_url || task.recordingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium break-all"
                        >
                          {task.recording_url || task.recordingUrl}
                        </a>
                        <p className="text-xs font-bold text-red-600 mt-1">
                          Aviso: Faça o download do vídeo, pois o link expirará em 30 dias.
                        </p>
                      </div>
                    </section>
                  )}

                  <section>
                    <h2 className="text-lg font-bold bg-slate-100 p-2 print:py-1 print:px-2 mb-3 print:mb-2 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
                      Descrição da Atividade
                    </h2>
                    <div className="bg-white p-4 print:p-3 rounded border border-slate-200 whitespace-pre-wrap text-sm min-h-[100px] print:min-h-0 text-slate-700">
                      {task.description || 'Nenhuma descrição fornecida para esta atividade.'}
                    </div>
                  </section>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <style>{`
          @media print {
            @page { 
              margin: 20mm 15mm;
              size: A4;
            }
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
              background-color: white; 
            }
            .print\\:hidden { display: none !important; }
            #rat-content { 
              padding: 0 !important; 
              max-width: 100% !important;
            }
            tr {
              page-break-inside: avoid;
              break-inside: avoid;
            }
            h2 {
              page-break-after: avoid;
              break-after: avoid;
            }
            .bg-white.min-h-screen {
              min-height: auto;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
