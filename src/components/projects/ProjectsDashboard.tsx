import useMainStore from '@/stores/main'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export function ProjectsDashboard() {
  const { projectStatuses, projects } = useMainStore()

  const chartData = projectStatuses.map((status) => {
    const count = projects.filter((p) => p.statusId === status.id).length
    return {
      name: status.name,
      count,
      fill: status.color,
      label: `${status.name} (${count})`,
    }
  })

  return (
    <Card className="shadow-sm border-muted/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-primary">Distribuição de Projetos</CardTitle>
        <CardDescription>Visão geral de projetos organizados por status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{ count: { label: 'Projetos' } }} className="h-[280px] w-full mt-2">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 30, top: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              width={220}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 13, fill: 'currentColor' }}
            />
            <ChartTooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
