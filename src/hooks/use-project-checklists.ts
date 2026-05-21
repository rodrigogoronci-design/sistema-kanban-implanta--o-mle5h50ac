import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface ProjectChecklist {
  id: string
  project_id: string
  title: string
  is_completed: boolean
  created_at: string
}

export function useProjectChecklists(projectId?: string) {
  const [checklists, setChecklists] = useState<ProjectChecklist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChecklists = async () => {
      let query = supabase
        .from('project_checklists')
        .select('*')
        .order('created_at', { ascending: true })
      if (projectId) {
        query = query.eq('project_id', projectId)
      }
      const { data } = await query
      if (data) setChecklists(data as ProjectChecklist[])
      setLoading(false)
    }

    fetchChecklists()

    const channel = supabase
      .channel(`project_checklists_changes_${projectId || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_checklists' }, () => {
        fetchChecklists()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const addChecklist = async (projId: string, title: string) => {
    await supabase.from('project_checklists').insert({ project_id: projId, title })
  }

  const toggleChecklist = async (id: string, is_completed: boolean) => {
    await supabase.from('project_checklists').update({ is_completed }).eq('id', id)
  }

  const deleteChecklist = async (id: string) => {
    await supabase.from('project_checklists').delete().eq('id', id)
  }

  return { checklists, loading, addChecklist, toggleChecklist, deleteChecklist }
}
