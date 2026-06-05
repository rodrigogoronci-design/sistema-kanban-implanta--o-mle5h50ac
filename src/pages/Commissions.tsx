import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { Loader2, DollarSign, Clock, CheckCircle } from 'lucide-react'

interface CommissionProject {
  id: string
  name: string
  commission_status: string
  impl_end: string | null
  forecast_end: string | null
  clients: {
    name: string
  } | null
}

export default function Commissions() {
  const [projects, setProjects] = useState<CommissionProject[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('all')

  const fetchProjects = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, commission_status, impl_end, forecast_end, clients(name)')
      .eq('generates_commission', true)
      .order('impl_end', { ascending: false, nullsFirst: false })

    if (error) {
      toast.error('Erro ao carregar comissões')
      console.error(error)
    } else {
      setProjects((data as any) || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    const originalProject = projects.find((p) => p.id === id)
    if (!originalProject) return
    const currentStatus = originalProject.commission_status

    if (currentStatus === newStatus) return

    // Optimistic update
    setProjects(projects.map((p) => (p.id === id ? { ...p, commission_status: newStatus } : p)))

    const { error } = await supabase
      .from('projects')
      .update({ commission_status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('Erro ao atualizar status')
      // Revert
      setProjects(
        projects.map((p) => (p.id === id ? { ...p, commission_status: currentStatus } : p)),
      )
    } else {
      toast.success(`Status atualizado para ${newStatus}`)
    }
  }

  // Generate available months for filter based on loaded projects
  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    projects.forEach((p) => {
      const dateStr = p.impl_end || p.forecast_end
      if (dateStr) {
        const date = parseISO(dateStr)
        const monthYear = format(date, 'yyyy-MM')
        months.add(monthYear)
      }
    })
    return Array.from(months).sort().reverse()
  }, [projects])

  const filteredProjects = useMemo(() => {
    if (selectedMonth === 'all') return projects

    return projects.filter((p) => {
      const dateStr = p.impl_end || p.forecast_end
      if (!dateStr) return false
      const monthYear = format(parseISO(dateStr), 'yyyy-MM')
      return monthYear === selectedMonth
    })
  }, [projects, selectedMonth])

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR })
  }

  const pendingCount = filteredProjects.filter((p) => p.commission_status === 'Pendente').length
  const paidCount = filteredProjects.filter((p) => p.commission_status === 'Pago').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Controle de Comissões</h2>
          <p className="text-muted-foreground">Gerencie os pagamentos de comissões de projetos</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {availableMonths.map((m) => {
                const date = parseISO(`${m}-01`)
                const monthLabel = format(date, 'MMMM / yyyy', { locale: ptBR })
                const capitalizedLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
                return (
                  <SelectItem key={m} value={m}>
                    {capitalizedLabel}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total de Projetos</h3>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{filteredProjects.length}</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Comissões Pendentes</h3>
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{pendingCount}</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Comissões Pagas</h3>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{paidCount}</div>
          </div>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Projeto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Data (Fim Previsto/Impl)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum projeto com comissão encontrado para este período.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.clients?.name || '-'}</TableCell>
                  <TableCell>
                    {project.impl_end ? (
                      <span title="Término da Implantação">{formatDate(project.impl_end)}</span>
                    ) : (
                      <span className="text-muted-foreground" title="Término Previsto">
                        {formatDate(project.forecast_end)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={project.commission_status === 'Pago' ? 'default' : 'secondary'}
                      className={
                        project.commission_status === 'Pago'
                          ? 'bg-green-100 text-green-800 hover:bg-green-100'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      }
                    >
                      {project.commission_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={project.commission_status || 'Pendente'}
                      onValueChange={(value) => handleStatusChange(project.id, value)}
                    >
                      <SelectTrigger className="w-[130px] ml-auto h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
