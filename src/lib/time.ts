export const getTaskHours = (task: any): number => {
  if (!task) return 0

  const entries = Array.isArray(task) ? task : task.timeEntries || task.time_entries || []

  if (!Array.isArray(entries)) return 0

  return entries.reduce((total: number, entry: any) => {
    const startStr = entry.start_time || entry.start || entry.startTime
    const endStr = entry.end_time || entry.end || entry.endTime

    if (!startStr || !endStr) return total

    const start = new Date(startStr)
    const end = new Date(endStr)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return total

    const diffInMs = end.getTime() - start.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)

    return total + Math.max(0, diffInHours)
  }, 0)
}
