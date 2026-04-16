import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { PieChart, ListTodo, CheckCircle, Clock } from 'lucide-react'

export default function Reports() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    totalProjects: 0,
    totalClients: 0,
  })
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tasksRes, projectsRes, clientsRes] = await Promise.all([
          supabase.from('tasks').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('clients').select('*', { count: 'exact', head: true }),
        ])

        setStats({
          totalTasks: tasksRes.count || 0,
          totalProjects: projectsRes.count || 0,
          totalClients: clientsRes.count || 0,
        })
      } catch (error: any) {
        toast({
          title: 'Erro ao carregar relatórios',
          description: error.message,
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        Carregando relatórios...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios e Métricas</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema e andamento dos projetos de implantação.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Registradas em todos os quadros</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Sendo acompanhados no momento</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Cadastrados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground mt-1">Em sua base de dados</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Métricas Detalhadas de Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex flex-col items-center justify-center rounded-md text-muted-foreground bg-muted/20">
            <Clock className="w-10 h-10 mb-4 opacity-50" />
            <p>Mais gráficos e relatórios detalhados estarão disponíveis em breve.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
