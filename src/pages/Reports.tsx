import { useMemo } from 'react'
import useMainStore from '@/stores/main'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Clock, Building2, Briefcase } from 'lucide-react'
import { getTaskHours } from '@/lib/time'

export default function Reports() {
  const { tasks, projects, clients } = useMainStore()

  const stats = useMemo(() => {
    let totalHours = 0
    const projectHoursMap: Record<string, number> = {}
    const clientHoursMap: Record<string, number> = {}

    tasks.forEach((task) => {
      const hours = getTaskHours(task)
      if (hours > 0) {
        totalHours += hours

        if (task.projectId) {
          projectHoursMap[task.projectId] = (projectHoursMap[task.projectId] || 0) + hours
        }
        if (task.clientId) {
          clientHoursMap[task.clientId] = (clientHoursMap[task.clientId] || 0) + hours
        }
      }
    })

    const projectData = Object.entries(projectHoursMap)
      .map(([id, hours]) => {
        const proj = projects.find((p) => p.id === id)
        return { name: proj?.name || 'Desconhecido', hours: Number(hours.toFixed(1)) }
      })
      .sort((a, b) => b.hours - a.hours)

    const clientData = Object.entries(clientHoursMap)
      .map(([id, hours]) => {
        const cli = clients.find((c) => c.id === id)
        return { name: cli?.name || 'Desconhecido', hours: Number(hours.toFixed(1)) }
      })
      .sort((a, b) => b.hours - a.hours)

    return {
      totalHours: Number(totalHours.toFixed(1)),
      projectData,
      clientData,
      topProject: projectData[0] || { name: '-', hours: 0 },
      topClient: clientData[0] || { name: '-', hours: 0 },
    }
  }, [tasks, projects, clients])

  const chartConfig = {
    hours: {
      label: 'Horas',
      color: 'hsl(var(--primary))',
    },
  }

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Relatórios de Produtividade</h2>
        <p className="text-muted-foreground mt-2">
          Análise consolidada de horas investidas por projeto e cliente.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Horas
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Horas registradas no sistema</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliente Destaque
            </CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={stats.topClient.name}>
              {stats.topClient.name}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.topClient.hours}h investidas
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projeto Destaque
            </CardTitle>
            <Briefcase className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate" title={stats.topProject.name}>
              {stats.topProject.name}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.topProject.hours}h investidas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Horas por Projeto</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px]">
            {stats.projectData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.projectData}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        value.length > 15 ? value.substring(0, 15) + '...' : value
                      }
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `${value}h`}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
                    />
                    <Bar
                      dataKey="hours"
                      fill="var(--color-hours)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col shadow-sm">
          <CardHeader>
            <CardTitle>Horas por Cliente</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px]">
            {stats.clientData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={stats.clientData}
                      dataKey="hours"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={60}
                      label={({ name, percent }) =>
                        percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                      }
                      labelLine={false}
                      stroke="hsl(var(--background))"
                      strokeWidth={2}
                    >
                      {stats.clientData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
