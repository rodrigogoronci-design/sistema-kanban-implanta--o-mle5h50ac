import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { formatHoursAndMinutes, getTaskHours } from '@/lib/time'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RAT() {
  const { taskId } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

      setData({ task: taskData, analysts })
      setLoading(false)

      setTimeout(() => {
        window.print()
      }, 500)
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

  const { task, analysts } = data
  const totalHours = getTaskHours({ time_entries: task.time_entries })
  const participants = Array.isArray(task.participants) ? task.participants : []
  const trainedModules = Array.isArray(task.trained_modules) ? task.trained_modules : []

  return (
    <div className="bg-white min-h-screen">
      <div className="print:hidden p-4 bg-muted border-b flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Visualização de Impressão</p>
        <Button onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-2" /> Imprimir RAT
        </Button>
      </div>

      <div className="max-w-4xl mx-auto p-8 text-black" id="rat-content">
        <div className="border-b-2 border-slate-800 pb-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex items-center gap-6">
            <img
              src="https://img.usecurling.com/i?q=brand&shape=fill&color=black"
              alt="Logo da Empresa"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-800">
                Relatório de Atendimento Técnico
              </h1>
              <p className="text-slate-500 mt-1">Ref: {task.title}</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm font-semibold text-slate-600">
              Data de Emissão: {format(new Date(), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-bold bg-slate-100 p-2 mb-3 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
              Dados do Cliente
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                  Razão Social / Nome
                </p>
                <p className="font-medium text-base">{task.client?.name || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">CNPJ</p>
                <p className="font-medium text-base">{task.client?.cnpj || 'Não informado'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Projeto</p>
                <p className="font-medium text-base">{task.project?.name || 'Não informado'}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-slate-100 p-2 mb-3 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
              Detalhamento das Atividades
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="col-span-2 sm:col-span-4">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                  Profissional(is)
                </p>
                <p className="font-medium">
                  {analysts.length > 0
                    ? analysts.map((a: any) => a.nome).join(', ')
                    : 'Não informado'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Categoria</p>
                <p className="font-medium">{task.category?.name || 'Não informada'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Início</p>
                <p className="font-medium">
                  {task.start_date ? format(parseISO(task.start_date), 'dd/MM/yyyy HH:mm') : '-'}
                </p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Conclusão</p>
                <p className="font-medium">
                  {task.completion_date
                    ? format(parseISO(task.completion_date), 'dd/MM/yyyy HH:mm')
                    : '-'}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold bg-slate-100 p-2 mb-3 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
              Participantes Presentes
            </h2>
            {participants.length > 0 ? (
              <div className="border border-slate-200 rounded p-4">
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
              <p className="text-sm text-slate-500 italic p-4 border border-slate-200 border-dashed rounded">
                Nenhum participante registrado.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold bg-slate-100 p-2 mb-3 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
              Conteúdo / Módulos
            </h2>
            {trainedModules.length > 0 ? (
              <div className="border border-slate-200 rounded p-4">
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
              <p className="text-sm text-slate-500 italic p-4 border border-slate-200 border-dashed rounded">
                Nenhum módulo registrado.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold bg-slate-100 p-2 mb-3 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
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
                          new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
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
                            {entry.end_time ? format(parseISO(entry.end_time), 'HH:mm') : '-'}
                          </td>
                          <td className="px-4 py-2 text-slate-600">{entry.observation || '-'}</td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-slate-500 italic">
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
              <h2 className="text-lg font-bold bg-slate-100 p-2 mb-3 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
                Gravação de Treinamento
              </h2>
              <div className="bg-white p-4 rounded border border-slate-200 text-sm flex flex-col gap-2">
                <a
                  href={task.recording_url || task.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium break-all"
                >
                  {task.recording_url || task.recordingUrl}
                </a>
                <p className="text-xs font-bold text-red-600 mt-1">
                  Atenção: Por favor, faça o download do vídeo, pois o link expira em 30 dias.
                </p>
              </div>
            </section>
          )}

          <section>
            <h2 className="text-lg font-bold bg-slate-100 p-2 mb-3 border-l-4 border-slate-800 uppercase text-slate-800 text-sm">
              Descrição da Atividade
            </h2>
            <div className="bg-white p-4 rounded border border-slate-200 whitespace-pre-wrap text-sm min-h-[100px] text-slate-700">
              {task.description || 'Nenhuma descrição fornecida para esta atividade.'}
            </div>
          </section>
        </div>
        <style>{`
          @media print {
            @page { margin: 0; }
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact; 
              background-color: white; 
              padding: 1.5cm;
            }
            .print\\:hidden { display: none !important; }
            #rat-content { 
              padding: 0 !important; 
              max-width: 100% !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
