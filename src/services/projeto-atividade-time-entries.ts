import { supabase } from '@/lib/supabase/client'

const db = supabase as any

export interface ProjetoAtividadeTimeEntry {
  id: string
  projeto_atividade_id: string
  start_time: string
  end_time: string
  description: string | null
  created_at: string
}

export function calculateDurationHours(startTime: string, endTime: string): number {
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  const diffMs = end.getTime() - start.getTime()
  return Math.max(0, diffMs / (1000 * 60 * 60))
}

export function formatDuration(hours: number): string {
  if (!hours || isNaN(hours) || hours <= 0) return '0m'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  if (m > 0) return `${m}m`
  return '0m'
}

export async function fetchTimeEntriesByAtividade(
  atividadeId: string,
): Promise<ProjetoAtividadeTimeEntry[]> {
  const { data, error } = await db
    .from('projeto_atividade_time_entries')
    .select('*')
    .eq('projeto_atividade_id', atividadeId)
    .order('start_time', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchTimeEntriesByProject(
  projectId: string,
): Promise<ProjetoAtividadeTimeEntry[]> {
  const { data: atividades, error: aError } = await db
    .from('projeto_atividades')
    .select('id')
    .eq('project_id', projectId)
  if (aError) throw aError

  const ids = (atividades || []).map((a: any) => a.id)
  if (ids.length === 0) return []

  const { data, error } = await db
    .from('projeto_atividade_time_entries')
    .select('*')
    .in('projeto_atividade_id', ids)
    .order('start_time', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createTimeEntry(
  atividadeId: string,
  startTime: string,
  endTime: string,
  description?: string,
): Promise<ProjetoAtividadeTimeEntry> {
  const { data, error } = await db
    .from('projeto_atividade_time_entries')
    .insert({
      projeto_atividade_id: atividadeId,
      start_time: startTime,
      end_time: endTime,
      description: description || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await db.from('projeto_atividade_time_entries').delete().eq('id', id)
  if (error) throw error
}
