import { supabase } from '@/lib/supabase/client'
import { ProjetoAtividade } from './projetos-implantacao'

const db = supabase as any

export interface AtividadeWithRelations extends ProjetoAtividade {
  projeto_name: string | null
  client_name: string | null
  client_id: string | null
}

export async function fetchMyAtividades(userId: string): Promise<AtividadeWithRelations[]> {
  const { data: analista } = await db.from('analistas').select('id').eq('user_id', userId).single()

  if (!analista) return []

  const { data: atividades, error } = await db
    .from('projeto_atividades')
    .select('*')
    .eq('responsible_id', analista.id)

  if (error) throw error
  if (!atividades || atividades.length === 0) return []

  const projectIds = [...new Set(atividades.map((a: any) => a.project_id).filter(Boolean))]
  const { data: projetos } = await db
    .from('projetos_implantacao')
    .select('id, name, client_id')
    .in('id', projectIds)

  const clientIds = [...new Set((projetos || []).map((p: any) => p.client_id).filter(Boolean))]
  const { data: clients } =
    clientIds.length > 0
      ? await db.from('clients').select('id, name').in('id', clientIds)
      : { data: [] }

  const projetoMap = new Map((projetos || []).map((p: any) => [p.id, p]))
  const clientMap = new Map((clients || []).map((c: any) => [c.id, c]))

  return atividades.map((a: any) => {
    const projeto = projetoMap.get(a.project_id)
    return {
      ...a,
      projeto_name: projeto?.name || null,
      client_id: projeto?.client_id || null,
      client_name: projeto?.client_id ? clientMap.get(projeto.client_id)?.name || null : null,
    }
  })
}
