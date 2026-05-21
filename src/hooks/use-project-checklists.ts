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
    const { data, error } = await supabase
      .from('project_checklists')
      .insert({ project_id: projId, title })
      .select()
      .single()

    if (data && !error) {
      setChecklists((prev) => {
        if (prev.find((c) => c.id === data.id)) return prev
        return [...prev, data as ProjectChecklist]
      })
    }

    return { data, error }
  }

  const toggleChecklist = async (id: string, is_completed: boolean) => {
    // Optimistic update
    setChecklists((prev) => prev.map((c) => (c.id === id ? { ...c, is_completed } : c)))

    const { error } = await supabase
      .from('project_checklists')
      .update({ is_completed })
      .eq('id', id)

    if (error) {
      // Revert on error
      setChecklists((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_completed: !is_completed } : c)),
      )
    }

    return { error }
  }

  const deleteChecklist = async (id: string) => {
    const itemToDelete = checklists.find((c) => c.id === id)

    // Optimistic update
    setChecklists((prev) => prev.filter((c) => c.id !== id))

    const { error } = await supabase.from('project_checklists').delete().eq('id', id)

    if (error && itemToDelete) {
      // Revert on error
      setChecklists((prev) =>
        [...prev, itemToDelete].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        ),
      )
    }

    return { error }
  }

  return { checklists, loading, addChecklist, toggleChecklist, deleteChecklist }
}
