import { supabase } from '@/lib/supabase/client'

const db = supabase as any

export interface Jornada {
  id: string
  name: string
  description: string | null
  client_id: string | null
  created_at: string
}

export interface JornadaEtapa {
  id: string
  jornada_id: string
  name: string
  position: number
  created_at: string
}

export interface JornadaAtividade {
  id: string
  etapa_id: string
  name: string
  description: string | null
  estimated_hours: number | null
  created_at: string
}

export interface JornadaWithDetails extends Jornada {
  etapas: (JornadaEtapa & { atividades: JornadaAtividade[] })[]
}

export async function fetchJornadas(): Promise<Jornada[]> {
  const { data, error } = await db
    .from('jornadas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchJornadaDetails(id: string): Promise<JornadaWithDetails> {
  const { data: jornada, error: jError } = await db
    .from('jornadas')
    .select('*')
    .eq('id', id)
    .single()
  if (jError) throw jError

  const { data: etapas, error: eError } = await db
    .from('jornada_etapas')
    .select('*')
    .eq('jornada_id', id)
    .order('position', { ascending: true })
  if (eError) throw eError

  const etapaIds = (etapas || []).map((e: any) => e.id)
  const { data: atividades } = await db
    .from('jornada_atividades')
    .select('*')
    .in('etapa_id', etapaIds.length ? etapaIds : ['00000000-0000-0000-0000-000000000000'])

  return {
    ...jornada,
    etapas: (etapas || []).map((e: any) => ({
      ...e,
      atividades: (atividades || []).filter((a: any) => a.etapa_id === e.id),
    })),
  }
}

export async function createJornada(data: {
  name: string
  description?: string
  client_id?: string
}): Promise<Jornada> {
  const { data: result, error } = await db.from('jornadas').insert(data).select().single()
  if (error) throw error
  return result
}

export async function updateJornada(
  id: string,
  data: Partial<{ name: string; description: string; client_id: string }>,
): Promise<Jornada> {
  const { data: result, error } = await db
    .from('jornadas')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return result
}

export async function deleteJornada(id: string): Promise<void> {
  const { error } = await db.from('jornadas').delete().eq('id', id)
  if (error) throw error
}

export async function saveJornadaStructure(
  jornadaId: string,
  etapas: {
    name: string
    position: number
    atividades: { name: string; description?: string; estimated_hours?: number }[]
  }[],
): Promise<void> {
  await db.from('jornada_etapas').delete().eq('jornada_id', jornadaId)

  for (const etapa of etapas) {
    const { data: newEtapa, error } = await db
      .from('jornada_etapas')
      .insert({ jornada_id: jornadaId, name: etapa.name, position: etapa.position })
      .select()
      .single()
    if (error) throw error

    if (etapa.atividades.length > 0) {
      const { error: aError } = await db.from('jornada_atividades').insert(
        etapa.atividades.map((a: any) => ({
          etapa_id: newEtapa.id,
          name: a.name,
          description: a.description || null,
          estimated_hours: a.estimated_hours || null,
        })),
      )
      if (aError) throw aError
    }
  }
}
