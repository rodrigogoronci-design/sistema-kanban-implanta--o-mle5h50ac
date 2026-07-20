import { supabase } from '@/lib/supabase/client'
import { fetchJornadaDetails } from './jornadas'

const db = supabase as any

export interface ProjetoImplantacao {
  id: string
  jornada_id: string | null
  client_id: string | null
  name: string
  current_step_id: string | null
  status: string
  created_at: string
  data_demanda: string | null
  analyst_id: string | null
}

export interface ProjetoAtividade {
  id: string
  project_id: string
  etapa_id: string
  name: string
  description: string | null
  responsible_id: string | null
  status: string
  forecast_date: string | null
  realization_date: string | null
  hours_spent: number
  minutes_spent: number
  is_completed: boolean
  is_extra: boolean
  rat_url: string | null
}

export interface ProjetoWithDetails extends ProjetoImplantacao {
  atividades: ProjetoAtividade[]
  etapas: { id: string; name: string; position: number }[]
}

export async function fetchProjetos(): Promise<ProjetoImplantacao[]> {
  const { data, error } = await db
    .from('projetos_implantacao')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchProjetoDetails(id: string): Promise<ProjetoWithDetails> {
  const { data: projeto, error: pError } = await db
    .from('projetos_implantacao')
    .select('*')
    .eq('id', id)
    .single()
  if (pError) throw pError

  const { data: atividades, error: aError } = await db
    .from('projeto_atividades')
    .select('*')
    .eq('project_id', id)
  if (aError) throw aError

  let etapas: { id: string; name: string; position: number }[] = []
  if (projeto.jornada_id) {
    const { data: eData } = await db
      .from('jornada_etapas')
      .select('*')
      .eq('jornada_id', projeto.jornada_id)
      .order('position', { ascending: true })
    etapas = (eData || []).map((e: any) => ({ id: e.id, name: e.name, position: e.position }))
  }
  if (etapas.length === 0 && (atividades || []).length > 0) {
    const uniqueIds = [...new Set((atividades || []).map((a: any) => a.etapa_id))]
    etapas = uniqueIds.map((eid: string, idx: number) => ({
      id: eid,
      name: `Etapa ${idx + 1}`,
      position: idx,
    }))
  }

  return { ...projeto, atividades: atividades || [], etapas }
}

export async function createProjeto(
  name: string,
  jornadaId: string,
  clientId?: string,
  analystId?: string,
  dataDemanda?: string,
): Promise<ProjetoImplantacao> {
  const template = await fetchJornadaDetails(jornadaId)
  const firstEtapa = template.etapas[0]

  const { data: projeto, error } = await db
    .from('projetos_implantacao')
    .insert({
      name,
      jornada_id: jornadaId,
      client_id: clientId || null,
      current_step_id: firstEtapa?.id || null,
      status: 'Ativo',
      analyst_id: analystId || null,
      data_demanda: dataDemanda || null,
    })
    .select()
    .single()
  if (error) throw error

  const allAtividades: any[] = []
  for (const etapa of template.etapas) {
    for (const atv of etapa.atividades) {
      allAtividades.push({
        project_id: projeto.id,
        etapa_id: etapa.id,
        name: atv.name,
        description: atv.description,
        status: 'A Fazer',
        is_completed: false,
        is_extra: false,
      })
    }
  }
  if (allAtividades.length > 0) {
    const { error: aError } = await db.from('projeto_atividades').insert(allAtividades)
    if (aError) throw aError
  }

  return projeto
}

export async function updateProjeto(id: string, data: Partial<ProjetoImplantacao>): Promise<void> {
  const { error } = await db.from('projetos_implantacao').update(data).eq('id', id)
  if (error) throw error
}

export async function updateAtividade(id: string, data: Partial<ProjetoAtividade>): Promise<void> {
  const { error } = await db.from('projeto_atividades').update(data).eq('id', id)
  if (error) throw error
}

export async function addExtraAtividade(
  projectId: string,
  etapaId: string,
  name: string,
): Promise<ProjetoAtividade> {
  const { data, error } = await db
    .from('projeto_atividades')
    .insert({
      project_id: projectId,
      etapa_id: etapaId,
      name,
      status: 'A Fazer',
      is_completed: false,
      is_extra: true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAtividade(id: string): Promise<void> {
  const { error } = await db.from('projeto_atividades').delete().eq('id', id)
  if (error) throw error
}

export async function deleteProjeto(id: string): Promise<void> {
  const { error: aError } = await db.from('projeto_atividades').delete().eq('project_id', id)
  if (aError) throw aError
  const { error } = await db.from('projetos_implantacao').delete().eq('id', id)
  if (error) throw error
}

export async function checkAndUpdateProgression(
  projectId: string,
  etapas: { id: string; name: string; position: number }[],
  atividades: ProjetoAtividade[],
): Promise<void> {
  const { data: projeto } = await db
    .from('projetos_implantacao')
    .select('current_step_id')
    .eq('id', projectId)
    .single()
  if (!projeto?.current_step_id) return

  const currentStepAtividades = atividades.filter((a) => a.etapa_id === projeto.current_step_id)
  if (currentStepAtividades.length === 0) return

  const allCompleted = currentStepAtividades.every((a) => a.is_completed)
  if (!allCompleted) return

  const currentIdx = etapas.findIndex((e) => e.id === projeto.current_step_id)
  const nextStep = etapas[currentIdx + 1]

  if (nextStep) {
    await updateProjeto(projectId, { current_step_id: nextStep.id })
  } else {
    await updateProjeto(projectId, { status: 'Concluído' })
  }
}
