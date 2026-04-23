import useMainStore, { Project } from '@/stores/main'
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

interface Props {
  projects?: Project[]
}

export function ProjectsDashboard({ projects: propProjects }: Props) {
  const { projectStatuses, projects: storeProjects } = useMainStore()
  const projects = propProjects || storeProjects
  const totalProjects = projects.length

  const chartData = projectStatuses.map((status) => {
    const count = projects.filter((p) => p.statusId === status.id).length
    return {
      name: status.name,
      count,
      fill: status.color,
    }
  })

  const stackedData = [
    {
      name: 'Projetos',
      ...chartData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.count }), {}),
    },
  ]

  const chartConfig = projectStatuses.reduce(
    (acc, status) => {
      acc[status.name] = { label: status.name, color: status.color }
      return acc
    },
    {} as Record<string, { label: string; color: string }>,
  )

  return (
    <div className="flex flex-col gap-4 mb-2">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {projectStatuses.map((status) => {
          const count = projects.filter((p) => p.statusId === status.id).length
          return (
            <div
              key={status.id}
              className="relative overflow-hidden rounded-xl border bg-card p-4 flex flex-col justify-between shadow-sm transition-all hover:shadow-md group"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full opacity-60 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: status.color }}
              />
              <div className="flex items-center gap-2 mb-2 ml-1">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: status.color }}
                />
                <span
                  className="text-xs font-semibold text-muted-foreground truncate"
                  title={status.name}
                >
                  {status.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2 ml-1">
                <span className="text-2xl font-bold text-foreground">{count}</span>
              </div>
            </div>
          )
        })}
      </div>

      {totalProjects > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Visão Geral da Distribuição
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Total: {totalProjects}
            </span>
          </div>
          <ChartContainer config={chartConfig} className="h-[24px] w-full">
            <BarChart
              data={stackedData}
              layout="vertical"
              margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" hide />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={<ChartTooltipContent hideLabel />}
              />
              {chartData.map((entry) => {
                const nonZeroData = chartData.filter((d) => d.count > 0)
                const isOnly = nonZeroData.length === 1
                const isFirst = nonZeroData.length > 0 && entry.name === nonZeroData[0].name
                const isLast =
                  nonZeroData.length > 0 && entry.name === nonZeroData[nonZeroData.length - 1].name

                let radius: [number, number, number, number] = [0, 0, 0, 0]
                if (isOnly) radius = [4, 4, 4, 4]
                else if (isFirst) radius = [4, 0, 0, 4]
                else if (isLast) radius = [0, 4, 4, 0]

                return entry.count > 0 ? (
                  <Bar
                    key={entry.name}
                    dataKey={entry.name}
                    stackId="a"
                    fill={entry.fill}
                    radius={radius}
                  />
                ) : null
              })}
            </BarChart>
          </ChartContainer>
        </div>
      )}
    </div>
  )
}
