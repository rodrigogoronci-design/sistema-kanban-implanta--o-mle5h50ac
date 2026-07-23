import { supabase } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/types'

type ProjetoRow = Database['public']['Tables']['projetos_implantacao']['Row']

export type ProjetoImplantacao = ProjetoRow & {
  is_new_client?: boolean
  migrated_from_id?: string | null
  forecast_start?: string | null
  forecast_end?: string | null
  priority?: string | null
  notes?: string | null
  client?: { id: string; name: string } | null
  analyst?: { id: string; nome: string } | null
}

export type ProjetoAtividade = Database['public']['Tables']['projeto_atividades']['Row'] & {
  migrated_from_task_id?: string | null
  responsible?: { id: string; nome: string } | null
}

export type ProjetoWithDetails = ProjetoImplantacao & {
  etapas: Array<{
    id: string
    name: string
    position: number
    atividades: ProjetoAtividade[]
  }>
}

export async function fetchProjetos(filter?: {
  isNewClient?: boolean
}): Promise<ProjetoImplantacao[]> {
  let query = supabase
    .from('projetos_implantacao')
    .select('*, client:clients(id, name), analyst:analistas(id, nome)')
    .order('created_at', { ascending: false })

  if (filter?.isNewClient !== undefined) {
    query = query.eq('is_new_client' as any, filter.isNewClient) as any
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as unknown as ProjetoImplantacao[]
}

export async function fetchProjetoDetails(id: string): Promise<ProjetoWithDetails | null> {
  const { data: projeto, error } = await supabase
    .from('projetos_implantacao')
    .select('*, client:clients(id, name), analyst:analistas(id, nome)')
    .eq('id', id)
    .single()

  if (error || !projeto) return null

  const { data: etapas } = await supabase
    .from('jornada_etapas')
    .select('*')
    .eq('project_id', id)
    .order('position', { ascending: true })

  const etapasWithAtividades = await Promise.all(
    (etapas || []).map(async (etapa) => {
      const { data: atividades } = await supabase
        .from('projeto_atividades')
        .select('*, responsible:analistas(id, nome)')
        .eq('etapa_id', etapa.id)
        .order('name', { ascending: true })
      return { ...etapa, atividades: (atividades || []) as unknown as ProjetoAtividade[] }
    }),
  )

  return { ...projeto, etapas: etapasWithAtividades } as unknown as ProjetoWithDetails
}

export async function createProjeto(
  data: Partial<ProjetoImplantacao>,
): Promise<ProjetoImplantacao> {
  const insertData: Record<string, unknown> = {
    name: data.name,
    client_id: data.client_id || null,
    analyst_id: data.analyst_id || null,
    jornada_id: data.jornada_id || null,
    status: data.status || 'Ativo',
    data_demanda: data.data_demanda || null,
    is_new_client: data.is_new_client || false,
    priority: data.priority || 'Média',
    forecast_start: data.forecast_start || null,
    forecast_end: data.forecast_end || null,
    notes: data.notes || null,
  }

  const { data: result, error } = await supabase
    .from('projetos_implantacao')
    .insert(insertData as any)
    .select()
    .single()

  if (error) throw error
  return result as unknown as ProjetoImplantacao
}

export async function updateProjeto(
  id: string,
  data: Partial<ProjetoImplantacao>,
): Promise<ProjetoImplantacao> {
  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.client_id !== undefined) updateData.client_id = data.client_id
  if (data.analyst_id !== undefined) updateData.analyst_id = data.analyst_id
  if (data.jornada_id !== undefined) updateData.jornada_id = data.jornada_id
  if (data.status !== undefined) updateData.status = data.status
  if (data.data_demanda !== undefined) updateData.data_demanda = data.data_demanda
  if (data.is_new_client !== undefined) updateData.is_new_client = data.is_new_client
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.forecast_start !== undefined) updateData.forecast_start = data.forecast_start
  if (data.forecast_end !== undefined) updateData.forecast_end = data.forecast_end
  if (data.notes !== undefined) updateData.notes = data.notes

  const { data: result, error } = await supabase
    .from('projetos_implantacao')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as unknown as ProjetoImplantacao
}

export async function updateAtividade(
  id: string,
  data: Partial<ProjetoAtividade>,
): Promise<ProjetoAtividade> {
  const updateData: Record<string, unknown> = { ...data }
  delete updateData.responsible
  delete updateData.migrated_from_task_id

  const { data: result, error } = await supabase
    .from('projeto_atividades')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result as unknown as ProjetoAtividade
}

export async function addExtraAtividade(
  projetoId: string,
  etapaId: string,
  name: string,
): Promise<ProjetoAtividade> {
  const { data, error } = await supabase
    .from('projeto_atividades')
    .insert({
      project_id: projetoId,
      etapa_id: etapaId,
      name,
      status: 'A Fazer',
      is_completed: false,
      is_extra: true,
      hours_spent: 0,
      minutes_spent: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as unknown as ProjetoAtividade
}

export async function deleteAtividade(id: string): Promise<void> {
  const { error } = await supabase.from('projeto_atividades').delete().eq('id', id)
  if (error) throw error
}

export async function deleteProjeto(id: string): Promise<void> {
  await supabase.from('projeto_atividades').delete().eq('project_id', id)
  await supabase.from('jornada_etapas').delete().eq('project_id', id)
  const { error } = await supabase.from('projetos_implantacao').delete().eq('id', id)
  if (error) throw error
}

export async function checkAndUpdateProgression(projetoId: string): Promise<void> {
  const { data: projeto } = await supabase
    .from('projetos_implantacao')
    .select('current_step_id')
    .eq('id', projetoId)
    .single()

  if (!projeto?.current_step_id) return

  const { data: pending } = await supabase
    .from('projeto_atividades')
    .select('id')
    .eq('project_id', projetoId)
    .eq('etapa_id', projeto.current_step_id)
    .eq('is_completed', false)

  if (pending && pending.length > 0) return

  const { data: etapas } = await supabase
    .from('jornada_etapas')
    .select('id, position')
    .eq('project_id', projetoId)
    .order('position', { ascending: true })

  if (!etapas || etapas.length === 0) return

  const currentIndex = etapas.findIndex((e: any) => e.id === projeto.current_step_id)
  if (currentIndex < 0 || currentIndex >= etapas.length - 1) return

  await supabase
    .from('projetos_implantacao')
    .update({ current_step_id: etapas[currentIndex + 1].id })
    .eq('id', projetoId)
}

export async function addEtapaToProject(projetoId: string, name: string): Promise<any> {
  const { data: etapas } = await supabase
    .from('jornada_etapas')
    .select('position')
    .eq('project_id', projetoId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = (etapas?.[0]?.position || 0) + 1

  const { data, error } = await supabase
    .from('jornada_etapas')
    .insert({ project_id: projetoId, name, position: nextPosition })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEtapaFromProject(etapaId: string): Promise<void> {
  const { error } = await supabase.from('jornada_etapas').delete().eq('id', etapaId)
  if (error) throw error
}

export async function addAtividadeToProject(
  projetoId: string,
  etapaId: string,
  name: string,
): Promise<ProjetoAtividade> {
  const { data, error } = await supabase
    .from('projeto_atividades')
    .insert({
      project_id: projetoId,
      etapa_id: etapaId,
      name,
      status: 'A Fazer',
      is_completed: false,
      is_extra: false,
      hours_spent: 0,
      minutes_spent: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as unknown as ProjetoAtividade
}
