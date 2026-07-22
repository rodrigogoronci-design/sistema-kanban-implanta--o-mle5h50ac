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
  } else {
    const { data: eData } = await db
      .from('jornada_etapas')
      .select('*')
      .eq('project_id', id)
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
  jornadaId?: string,
  clientId?: string,
  analystId?: string,
  dataDemanda?: string,
): Promise<ProjetoImplantacao> {
  let firstEtapaId: string | null = null
  let template: Awaited<ReturnType<typeof fetchJornadaDetails>> | null = null

  if (jornadaId) {
    template = await fetchJornadaDetails(jornadaId)
    firstEtapaId = template.etapas[0]?.id || null
  }

  const { data: projeto, error } = await db
    .from('projetos_implantacao')
    .insert({
      name,
      jornada_id: jornadaId || null,
      client_id: clientId || null,
      current_step_id: firstEtapaId,
      status: 'Ativo',
      analyst_id: analystId || null,
      data_demanda: dataDemanda || null,
    })
    .select()
    .single()
  if (error) throw error

  if (template) {
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
    .select('current_step_id, status')
    .eq('id', projectId)
    .single()
  if (!projeto) return

  const allCompleted = atividades.length > 0 && atividades.every((a) => a.is_completed)

  if (allCompleted) {
    if (projeto.status !== 'Concluído') {
      await updateProjeto(projectId, { status: 'Concluído' })
    }
    return
  }

  const updates: Partial<ProjetoImplantacao> = {}

  if (projeto.status === 'Concluído') {
    updates.status = 'Ativo'
  }

  const firstIncompleteStep = etapas.find((etapa) => {
    const stepAtividades = atividades.filter((a) => a.etapa_id === etapa.id)
    return stepAtividades.length > 0 && stepAtividades.some((a) => !a.is_completed)
  })

  if (firstIncompleteStep) {
    const currentIdx = etapas.findIndex((e) => e.id === projeto.current_step_id)
    const firstIncompleteIdx = etapas.findIndex((e) => e.id === firstIncompleteStep.id)
    if (currentIdx === -1 || firstIncompleteIdx < currentIdx) {
      updates.current_step_id = firstIncompleteStep.id
    }
  }

  if (Object.keys(updates).length > 0) {
    await updateProjeto(projectId, updates)
  }

  if (!updates.current_step_id && projeto.current_step_id) {
    const currentStepAtividades = atividades.filter((a) => a.etapa_id === projeto.current_step_id)
    if (currentStepAtividades.length > 0 && currentStepAtividades.every((a) => a.is_completed)) {
      const currentIdx = etapas.findIndex((e) => e.id === projeto.current_step_id)
      const nextStep = etapas[currentIdx + 1]
      if (nextStep) {
        await updateProjeto(projectId, { current_step_id: nextStep.id })
      }
    }
  }
}

export async function addEtapaToProject(
  projectId: string,
  name: string,
  position: number,
): Promise<{ id: string; name: string; position: number }> {
  const { data, error } = await db
    .from('jornada_etapas')
    .insert({
      project_id: projectId,
      jornada_id: null,
      name,
      position,
    })
    .select()
    .single()
  if (error) throw error
  return { id: data.id, name: data.name, position: data.position }
}

export async function deleteEtapaFromProject(etapaId: string): Promise<void> {
  const { error: aError } = await db.from('projeto_atividades').delete().eq('etapa_id', etapaId)
  if (aError) throw aError
  const { error } = await db.from('jornada_etapas').delete().eq('id', etapaId)
  if (error) throw error
}

export async function addAtividadeToProject(
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
      is_extra: false,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
