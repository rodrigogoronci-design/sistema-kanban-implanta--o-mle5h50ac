import { supabase } from '@/lib/supabase/client'
import { ProjetoAtividade } from './projetos-implantacao'

const db = supabase as any

export interface AtividadeWithRelations extends ProjetoAtividade {
  projeto_name: string | null
  client_name: string | null
  client_id: string | null
}

export async function fetchUserAnalystId(userId: string): Promise<string | null> {
  const { data: analista } = await db.from('analistas').select('id').eq('user_id', userId).single()
  return analista?.id || null
}

export async function fetchAtividades(
  responsibleId?: string | null,
): Promise<AtividadeWithRelations[]> {
  let query = db.from('projeto_atividades').select('*')
  if (responsibleId) {
    query = query.eq('responsible_id', responsibleId)
  }
  const { data: atividades, error } = await query
  if (error) throw error
  if (!atividades || atividades.length === 0) return []

  const projectIds = [...new Set(atividades.map((a: any) => a.project_id).filter(Boolean))]
  const { data: projetos } = await db
    .from('projetos_implantacao')
    .select('id, name, client_id')
    .in('id', projectIds)

  const projetoMap = new Map((projetos || []).map((p: any) => [p.id, p]))

  const atividadeClientIds = atividades.map((a: any) => a.client_id).filter(Boolean)
  const projetoClientIds = (projetos || []).map((p: any) => p.client_id).filter(Boolean)
  const allClientIds = [...new Set([...atividadeClientIds, ...projetoClientIds])]

  const { data: clients } =
    allClientIds.length > 0
      ? await db.from('clients').select('id, name').in('id', allClientIds)
      : { data: [] }

  const clientMap = new Map((clients || []).map((c: any) => [c.id, c]))

  return atividades.map((a: any) => {
    const projeto = projetoMap.get(a.project_id)
    const resolvedClientId = a.client_id || projeto?.client_id || null
    return {
      ...a,
      projeto_name: projeto?.name || null,
      client_id: resolvedClientId,
      client_name: resolvedClientId ? clientMap.get(resolvedClientId)?.name || null : null,
    }
  })
}

export async function fetchMyAtividades(userId: string): Promise<AtividadeWithRelations[]> {
  const analistaId = await fetchUserAnalystId(userId)
  if (!analistaId) return []
  return fetchAtividades(analistaId)
}
