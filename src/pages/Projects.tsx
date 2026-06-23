import { useState } from 'react'
import useMainStore, { Project } from '@/stores/main'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Trash2,
  Edit2,
  Briefcase,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  DollarSign,
} from 'lucide-react'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { getTaskHours, formatHoursAndMinutes } from '@/lib/time'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProjectChecklists } from '@/hooks/use-project-checklists'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import html2pdf from 'html2pdf.js'

const formatSafeDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '--/--/----'
  try {
    const d = parseISO(dateStr)
    const correctedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000)
    return format(correctedDate, 'dd/MM/yyyy')
  } catch {
    return '--/--/----'
  }
}

export default function Projects() {
  const {
    projects,
    clients,
    users,
    analysts,
    projectStatuses,
    tasks,
    addProject,
    updateProject,
    deleteProject,
  } = useMainStore()

  const { checklists } = useProjectChecklists()

  const [isTogglingCommission, setIsTogglingCommission] = useState<Record<string, boolean>>({})
  const [isTogglingNewClient, setIsTogglingNewClient] = useState<Record<string, boolean>>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [analystFilter, setAnalystFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [financialFilter, setFinancialFilter] = useState<string>('all')
  const [isNewClientFilter, setIsNewClientFilter] = useState(false)

  const baseFilteredProjects = projects.filter((project) => {
    let match = true
    if (analystFilter !== 'all') {
      match = match && !!project.analystIds?.includes(analystFilter)
    }
    if (clientFilter !== 'all') {
      match = match && project.clientId === clientFilter
    }
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase()
      const projectNameMatch = project.name.toLowerCase().includes(searchLower)
      const client = clients.find((c) => c.id === project.clientId)
      const clientNameMatch = client ? client.name.toLowerCase().includes(searchLower) : false

      match = match && (projectNameMatch || clientNameMatch)
    }
    return match
  })

  const projectsForNewClientCount = baseFilteredProjects.filter((project) => {
    let match = true
    if (statusFilter !== 'all') {
      match = match && project.statusId === statusFilter
    }
    if (financialFilter === 'gera-comissao') {
      match = match && project.generates_commission === true
    } else if (financialFilter === 'pendentes') {
      match =
        match && project.generates_commission === true && project.commission_status === 'Pendente'
    } else if (financialFilter === 'pagas') {
      match = match && project.generates_commission === true && project.commission_status === 'Pago'
    } else if (financialFilter === 'sem-comissao') {
      match = match && !project.generates_commission
    }
    return match
  })

  const totalNewClients = projectsForNewClientCount.filter((p) => p.is_new_client).length

  const commonFilteredProjects = baseFilteredProjects.filter((project) => {
    if (isNewClientFilter) {
      return !!project.is_new_client
    }
    return true
  })

  const projectsForStatusCounts = commonFilteredProjects.filter((project) => {
    if (financialFilter === 'gera-comissao') return project.generates_commission === true
    if (financialFilter === 'pendentes')
      return project.generates_commission === true && project.commission_status === 'Pendente'
    if (financialFilter === 'pagas')
      return project.generates_commission === true && project.commission_status === 'Pago'
    if (financialFilter === 'sem-comissao') return !project.generates_commission
    return true
  })

  const projectsForFinancialCounts = commonFilteredProjects.filter((project) => {
    if (statusFilter !== 'all') {
      return project.statusId === statusFilter
    }
    return true
  })

  const filteredProjects = commonFilteredProjects.filter((project) => {
    let match = true
    if (statusFilter !== 'all') {
      match = match && project.statusId === statusFilter
    }
    if (financialFilter === 'gera-comissao') {
      match = match && project.generates_commission === true
    } else if (financialFilter === 'pendentes') {
      match =
        match && project.generates_commission === true && project.commission_status === 'Pendente'
    } else if (financialFilter === 'pagas') {
      match = match && project.generates_commission === true && project.commission_status === 'Pago'
    } else if (financialFilter === 'sem-comissao') {
      match = match && !project.generates_commission
    }
    return match
  })

  const totalStatusCount = projectsForStatusCounts.length
  const getStatusCount = (statusId: string) =>
    projectsForStatusCounts.filter((p) => p.statusId === statusId).length

  const allCount = projectsForFinancialCounts.length
  const geraComissaoCount = projectsForFinancialCounts.filter(
    (p) => p.generates_commission === true,
  ).length
  const pendentesCount = projectsForFinancialCounts.filter(
    (p) => p.generates_commission === true && p.commission_status === 'Pendente',
  ).length
  const pagasCount = projectsForFinancialCounts.filter(
    (p) => p.generates_commission === true && p.commission_status === 'Pago',
  ).length
  const semComissaoCount = projectsForFinancialCounts.filter((p) => !p.generates_commission).length

  const handleCreate = () => {
    setEditingProject(undefined)
    setModalOpen(true)
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setModalOpen(true)
  }

  const handleToggleNewClient = async (projectId: string, newValue: boolean) => {
    setIsTogglingNewClient((prev) => ({ ...prev, [projectId]: true }))
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          is_new_client: newValue,
        })
        .eq('id', projectId)

      if (error) throw error

      const project = projects.find((p) => p.id === projectId)
      if (project) {
        updateProject(projectId, {
          ...project,
          is_new_client: newValue,
        })
      }
      toast.success(
        newValue ? 'Projeto atualizado: Novo Cliente.' : 'Projeto atualizado: Cliente Existente.',
      )
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao atualizar status de novo cliente: ' + error.message)
    } finally {
      setIsTogglingNewClient((prev) => ({ ...prev, [projectId]: false }))
    }
  }

  const handleToggleCommission = async (projectId: string, newValue: boolean) => {
    setIsTogglingCommission((prev) => ({ ...prev, [projectId]: true }))
    try {
      const newCommissionStatus = newValue ? 'Pendente' : null

      const { error } = await supabase
        .from('projects')
        .update({
          generates_commission: newValue,
          commission_status: newCommissionStatus,
        })
        .eq('id', projectId)

      if (error) throw error

      const project = projects.find((p) => p.id === projectId)
      if (project) {
        updateProject(projectId, {
          ...project,
          generates_commission: newValue,
          commission_status: newCommissionStatus,
        })
      }
      toast.success(
        newValue ? 'Projeto atualizado: gera comissão.' : 'Projeto atualizado: não gera comissão.',
      )
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao atualizar comissão: ' + error.message)
    } finally {
      setIsTogglingCommission((prev) => ({ ...prev, [projectId]: false }))
    }
  }

  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const exportCSV = () => {
    try {
      setIsExporting(true)
      const headers = [
        'Projeto',
        'Empresa',
        'Responsável',
        'Status',
        'Prioridade',
        'Horas Contratadas',
        'Início Implantação',
        'Fim Implantação',
        'Início Treinamento',
        'Fim Treinamento',
        'Início Operação',
        'Fim Operação',
        'Início Previsão',
        'Fim Previsão',
        'Gera Comissão',
        'Status Comissão',
        'Implantação Novo Cliente',
      ]

      const rows = filteredProjects.map((project) => {
        const client = clients.find((c) => c.id === project.clientId)?.name || ''
        const analystIds = project.analystIds || []
        const analystNames = analystIds
          .map(
            (id) =>
              analysts.find((a) => a.id === id)?.nome || users.find((u) => u.id === id)?.name || '',
          )
          .filter(Boolean)
          .join(', ')
        const status = projectStatuses.find((s) => s.id === project.statusId)?.name || ''

        const esc = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`

        return [
          esc(project.name),
          esc(client),
          esc(analystNames),
          esc(status),
          esc((project as any).priority || 'Média'),
          esc(project.contractedHours || 0),
          esc(formatSafeDate(project.implStart)),
          esc(formatSafeDate(project.implEnd)),
          esc(formatSafeDate(project.trainStart)),
          esc(formatSafeDate(project.trainEnd)),
          esc(formatSafeDate(project.opStart)),
          esc(formatSafeDate(project.opEnd)),
          esc(formatSafeDate(project.forecastStart)),
          esc(formatSafeDate(project.forecastEnd)),
          esc(project.generates_commission ? 'Sim' : 'Não'),
          esc(project.commission_status || ''),
          esc(project.is_new_client ? 'Sim' : 'Não'),
        ].join(',')
      })

      const csvContent = [headers.join(','), ...rows].join('\n')
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `projetos_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Exportação CSV concluída com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar CSV')
    } finally {
      setIsExporting(false)
    }
  }

  const exportPDF = async () => {
    try {
      setIsExporting(true)
      const html = `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="margin-bottom: 5px;">Relatório de Projetos</h2>
          <p style="color: #666; font-size: 12px; margin-top: 0; margin-bottom: 20px;">
            Data de exportação: ${format(new Date(), 'dd/MM/yyyy HH:mm')}
          </p>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px; text-align: left;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Projeto</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Empresa</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Resp.</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Status</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Pri.</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Hrs</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Implantação</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Treinamento</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Operação</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Previsão</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Comissão</th>
                <th style="padding: 6px; border: 1px solid #e5e7eb;">Novo Cliente</th>
              </tr>
            </thead>
            <tbody>
              ${filteredProjects
                .map((project) => {
                  const client = clients.find((c) => c.id === project.clientId)?.name || ''
                  const analystIds = project.analystIds || []
                  const analystNames = analystIds
                    .map(
                      (id) =>
                        analysts.find((a) => a.id === id)?.nome ||
                        users.find((u) => u.id === id)?.name ||
                        '',
                    )
                    .filter(Boolean)
                    .join(', ')
                  const status = projectStatuses.find((s) => s.id === project.statusId)?.name || ''
                  const impl =
                    formatSafeDate(project.implStart) + ' - ' + formatSafeDate(project.implEnd)
                  const train =
                    formatSafeDate(project.trainStart) + ' - ' + formatSafeDate(project.trainEnd)
                  const oper =
                    formatSafeDate(project.opStart) + ' - ' + formatSafeDate(project.opEnd)
                  const prev =
                    formatSafeDate(project.forecastStart) +
                    ' - ' +
                    formatSafeDate(project.forecastEnd)
                  const comissao = project.generates_commission
                    ? 'Sim (' + (project.commission_status || '') + ')'
                    : 'Não'
                  const novoCli = project.is_new_client ? 'Sim' : 'Não'

                  return (
                    '<tr>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb;">' +
                    project.name +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb;">' +
                    client +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb;">' +
                    analystNames +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb;">' +
                    status +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb;">' +
                    ((project as any).priority || '-') +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb;">' +
                    (project.contractedHours || '-') +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb; white-space: nowrap;">' +
                    impl +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb; white-space: nowrap;">' +
                    train +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb; white-space: nowrap;">' +
                    oper +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb; white-space: nowrap;">' +
                    prev +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb;">' +
                    comissao +
                    '</td>' +
                    '<td style="padding: 6px; border: 1px solid #e5e7eb;">' +
                    novoCli +
                    '</td>' +
                    '</tr>'
                  )
                })
                .join('')}
            </tbody>
          </table>
        </div>
      `

      const element = document.createElement('div')
      element.innerHTML = html

      const opt = {
        margin: 10,
        filename: `projetos_export_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      }

      await html2pdf().set(opt).from(element).save()
      toast.success('Exportação PDF concluída com sucesso!')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSubmit = async (data: Omit<Project, 'id'> & any) => {
    setIsSaving(true)
    try {
      const dbData = {
        name: data.name,
        client_id: data.clientId || null,
        analyst_id: data.analystIds?.[0] || data.analystId || null,
        status_id: data.statusId || null,
        priority: data.priority || 'Média',
        notes: data.notes || null,
        contracted_hours: data.contractedHours || null,
        impl_start: data.implStart || null,
        impl_end: data.implEnd || null,
        train_start: data.trainStart || null,
        train_end: data.trainEnd || null,
        op_start: data.opStart || null,
        op_end: data.opEnd || null,
        forecast_start: data.forecastStart || null,
        forecast_end: data.forecastEnd || null,
        generates_commission: data.generates_commission || false,
        commission_status: data.generates_commission ? data.commission_status || 'Pendente' : null,
        is_new_client: data.is_new_client || false,
      }

      if (editingProject) {
        const { error } = await supabase.from('projects').update(dbData).eq('id', editingProject.id)
        if (error) throw error

        if (data.analystIds && data.analystIds.length > 0) {
          await supabase.from('project_analysts').delete().eq('project_id', editingProject.id)
          const paData = data.analystIds.map((aId: string) => ({
            project_id: editingProject.id,
            analyst_id: aId,
          }))
          await supabase.from('project_analysts').insert(paData)
        } else {
          await supabase.from('project_analysts').delete().eq('project_id', editingProject.id)
        }

        updateProject(editingProject.id, {
          ...data,
          clientId: dbData.client_id,
          statusId: dbData.status_id,
          analystId: dbData.analyst_id,
          generates_commission: dbData.generates_commission,
          commission_status: dbData.commission_status,
          is_new_client: dbData.is_new_client,
        })
        toast.success('Projeto atualizado com sucesso!')
      } else {
        const { data: newProject, error } = await supabase
          .from('projects')
          .insert([dbData])
          .select()
          .single()
        if (error) throw error

        if (data.analystIds && data.analystIds.length > 0) {
          const paData = data.analystIds.map((aId: string) => ({
            project_id: newProject.id,
            analyst_id: aId,
          }))
          await supabase.from('project_analysts').insert(paData)
        }

        addProject({
          ...data,
          id: newProject.id,
          clientId: dbData.client_id,
          statusId: dbData.status_id,
          analystId: dbData.analyst_id,
          generates_commission: dbData.generates_commission,
          commission_status: dbData.commission_status,
          is_new_client: dbData.is_new_client,
        })
        toast.success('Projeto criado com sucesso!')
      }
      setModalOpen(false)
    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao salvar o projeto: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este projeto?')) {
      try {
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) throw error
        deleteProject(id)
        toast.success('Projeto excluído com sucesso!')
      } catch (error: any) {
        console.error(error)
        toast.error('Erro ao excluir o projeto: ' + error.message)
      }
    }
  }

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'Alta':
        return <ArrowUp className="w-4 h-4 text-red-500" />
      case 'Baixa':
        return <ArrowDown className="w-4 h-4 text-blue-500" />
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
            <p className="text-sm text-muted-foreground">Gerencie os projetos de implantação.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="shrink-0" disabled={isExporting}>
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exportando...' : 'Exportar'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportCSV}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportPDF}>
                  <FileText className="w-4 h-4 mr-2" /> Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleCreate} className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-2">
          <div className="relative flex-1 w-full sm:w-auto sm:min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projeto ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as empresas</SelectItem>
              {[...clients]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={analystFilter} onValueChange={setAnalystFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os responsáveis</SelectItem>
              {analysts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.nome || a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center">
          <div className="w-full xl:w-auto overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="w-max inline-flex justify-start h-10 items-center bg-muted p-1 rounded-md">
              <button
                onClick={() => setIsNewClientFilter(!isNewClientFilter)}
                className={cn(
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-4 gap-2 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                  isNewClientFilter
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:bg-background/50 text-muted-foreground',
                )}
              >
                <Briefcase className="w-4 h-4" />
                Novos Clientes
                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs bg-background">
                  {totalNewClients}
                </Badge>
              </button>
            </div>
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full xl:w-auto">
            <div className="overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <TabsList className="w-max inline-flex justify-start h-10 items-center bg-muted p-1 rounded-md">
                <TabsTrigger value="all" className="gap-2 px-4">
                  Todos
                  <Badge variant="secondary" className="px-1.5 py-0.5 text-xs bg-background">
                    {totalStatusCount}
                  </Badge>
                </TabsTrigger>
                {projectStatuses.map((s) => (
                  <TabsTrigger key={s.id} value={s.id} className="gap-2 px-4">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                    <Badge variant="secondary" className="px-1.5 py-0.5 text-xs bg-background">
                      {getStatusCount(s.id)}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        <Tabs value={financialFilter} onValueChange={setFinancialFilter} className="w-full">
          <div className="overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <TabsList className="w-max inline-flex justify-start h-10 items-center bg-muted p-1 rounded-md">
              <TabsTrigger value="all" className="px-4 gap-2">
                Todas
                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs bg-background">
                  {allCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="gera-comissao" className="px-4 gap-2">
                Gera Comissão
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 text-xs bg-primary/10 text-primary"
                >
                  {geraComissaoCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pendentes" className="px-4 gap-2">
                Pendentes
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 text-xs bg-yellow-500/10 text-yellow-600"
                >
                  {pendentesCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pagas" className="px-4 gap-2">
                Pagas
                <Badge
                  variant="secondary"
                  className="px-1.5 py-0.5 text-xs bg-emerald-500/10 text-emerald-600"
                >
                  {pagasCount}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="sem-comissao" className="px-4 gap-2">
                Sem Comissão
                <Badge variant="secondary" className="px-1.5 py-0.5 text-xs bg-background">
                  {semComissaoCount}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Projeto</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Responsáveis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Comissão</TableHead>
              <TableHead>Checklist</TableHead>
              <TableHead>Prazos</TableHead>
              <TableHead>Horas</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => {
                const client = clients.find((c) => c.id === project.clientId)
                const status = projectStatuses.find((s) => s.id === project.statusId)
                const pTasks = tasks.filter((t) => t.projectId === project.id)
                const hours = pTasks.reduce((acc, t) => acc + getTaskHours(t), 0)

                const projChecklists = checklists.filter((c) => c.project_id === project.id)
                const completedChecklists = projChecklists.filter((c) => c.is_completed).length
                const checklistProgress =
                  projChecklists.length > 0
                    ? (completedChecklists / projChecklists.length) * 100
                    : 0
                const priority = (project as any).priority || 'Média'

                return (
                  <TableRow key={project.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium max-w-[200px] truncate">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="truncate" title={project.name}>
                            {project.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Switch
                            checked={!!project.is_new_client}
                            onCheckedChange={(checked) =>
                              handleToggleNewClient(project.id, checked)
                            }
                            disabled={isTogglingNewClient[project.id]}
                            className="scale-75 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                          />
                          <span className="text-[10px] text-muted-foreground">Novo Cliente</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground max-w-[150px] truncate"
                      title={client?.name || '-'}
                    >
                      {client?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {project.analystIds?.length ? (
                          project.analystIds.map((aId) => {
                            const a =
                              analysts.find((an) => an.id === aId) ||
                              users.find((u) => u.id === aId)
                            return a ? (
                              <Badge
                                key={aId}
                                variant="secondary"
                                className="text-xs font-normal truncate max-w-[100px]"
                              >
                                {a.nome || a.name}
                              </Badge>
                            ) : null
                          })
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {status ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: status.color }}
                          />
                          <span className="text-sm whitespace-nowrap">{status.name}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        {getPriorityIcon(priority)}
                        <span>{priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!project.generates_commission}
                          onCheckedChange={(checked) => handleToggleCommission(project.id, checked)}
                          disabled={isTogglingCommission[project.id]}
                        />
                        {project.generates_commission && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs font-normal whitespace-nowrap transition-all duration-300',
                              project.commission_status === 'Pago'
                                ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200'
                                : 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200',
                            )}
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            {project.commission_status || 'Pendente'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-[100px]">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{Math.round(checklistProgress)}%</span>
                          <span>
                            {completedChecklists}/{projChecklists.length}
                          </span>
                        </div>
                        <Progress value={checklistProgress} className="h-1.5" />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <div>I: {formatSafeDate(project.forecastStart)}</div>
                        <div>T: {formatSafeDate(project.forecastEnd)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-[80px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{formatHoursAndMinutes(hours)}</span>
                          {(() => {
                            const contracted = project.contractedHours
                            return (
                              <span className="text-muted-foreground">
                                {contracted ? `${contracted}h` : '-'}
                              </span>
                            )
                          })()}
                        </div>
                        {(() => {
                          const contracted = project.contractedHours
                          if (!contracted) return null
                          const ratio = hours / contracted
                          const percent = Math.min(ratio * 100, 100)
                          let colorClass = 'bg-emerald-500'
                          if (ratio >= 1) colorClass = 'bg-red-500'
                          else if (ratio >= 0.75) colorClass = 'bg-yellow-500'

                          return (
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className={cn('h-full transition-all duration-500', colorClass)}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          )
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(project.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ProjectFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        project={editingProject}
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  )
}
