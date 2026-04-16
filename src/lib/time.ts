import { Task } from '@/stores/main'

export function getTaskHours(task: Task): number {
  if (!task.timeEntries) return 0
  return task.timeEntries.reduce((acc, entry) => {
    const start = new Date(entry.start).getTime()
    const end = new Date(entry.end).getTime()
    if (!isNaN(start) && !isNaN(end)) {
      return acc + (end - start) / (1000 * 60 * 60)
    }
    return acc
  }, 0)
}
