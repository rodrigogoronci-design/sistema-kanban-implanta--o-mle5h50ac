import { useSyncExternalStore, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
}
export interface ClientContact {
  id: string
  name: string
  email: string
  phone: string
}
export interface Client {
  id: string
  name: string
  cnpj: string
  contacts: ClientContact[]
  modules: string[]
  logo: string
  registrationDate?: string
  website?: string
  serverIp?: string
  notes?: string
}
export interface ProjectStatus {
  id: string
  name: string
  color: string
}

export interface Project {
  id: string
  name: string
  clientId: string
  analystId: string
  statusId: string
  implStart?: string
  implEnd?: string
  trainStart?: string
  trainEnd?: string
  opStart?: string
  opEnd?: string
}
export interface Subtask {
  id: string
  title: string
  completed: boolean
}
export interface AttachmentTag {
  id: string
  name: string
  color: string
}
export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  createdAt: string
  tagIds?: string[]
}
export interface TimeEntry {
  id: string
  start: string
  end: string
  observation: string
}
export interface Category {
  id: string
  name: string
  color: string
}
export interface Task {
  id: string
  title: string
  clientId: string
  projectId: string
  responsibleId: string
  priority: 'Baixa' | 'Média' | 'Alta'
  categoryId?: string
  columnId: string
  description: string
  checklist: Subtask[]
  attachments?: Attachment[]
  startDate?: string
  endDate?: string
  timeEntries: TimeEntry[]
  createdAt: string
  dueDate?: string
}
export interface Column {
  id: string
  title: string
  archived?: boolean
}

export interface MainState {
  users: User[]
  clients: Client[]
  projects: Project[]
  tasks: Task[]
  columns: Column[]
  categories: Category[]
  projectStatuses: ProjectStatus[]
  attachmentTags: AttachmentTag[]
  loaded: boolean
}

const initialState: MainState = {
  users: [],
  clients: [],
  projects: [],
  tasks: [],
  columns: [],
  categories: [],
  projectStatuses: [],
  attachmentTags: [],
  loaded: false,
}

class Store {
  state: MainState
  listeners: Set<() => void>

  constructor() {
    this.state = initialState
    this.listeners = new Set()
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  setState(updater: (state: MainState) => MainState) {
    this.state = updater(this.state)
    this.listeners.forEach((l) => l())
  }
}

const store = new Store()

let isFetching = false

async function loadInitialData() {
  if (isFetching || store.state.loaded) return
  isFetching = true

  try {
    const [
      { data: colabs },
      { data: clients },
      { data: contacts },
      { data: projs },
      { data: statuses },
      { data: cols },
      { data: cats },
      { data: tasks },
      { data: subtasks },
      { data: attachments },
      { data: attachmentTags },
      { data: taskTags },
      { data: timeEntries },
    ] = await Promise.all([
      supabase.from('colaboradores').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('client_contacts').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('project_statuses').select('*'),
      supabase.from('columns').select('*').order('position'),
      supabase.from('categories').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('subtasks').select('*'),
      supabase.from('attachments').select('*'),
      supabase.from('attachment_tags').select('*'),
      supabase.from('task_attachment_tags').select('*'),
      supabase.from('time_entries').select('*'),
    ])

    store.setState((s) => ({
      ...s,
      loaded: true,
      users: (colabs || []).map((c: any) => ({
        id: c.id,
        name: c.nome,
        email: c.email,
        phone: c.telefone || '',
        avatar: c.image_gender ? `https://img.usecurling.com/ppl/thumbnail?seed=${c.nome}` : '',
      })),
      clients: (clients || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        cnpj: c.cnpj || '',
        logo: c.logo || '',
        registrationDate: c.registration_date || undefined,
        website: c.website || '',
        serverIp: c.server_ip || '',
        notes: c.notes || '',
        modules: c.modules || [],
        contacts: (contacts || [])
          .filter((ct: any) => ct.client_id === c.id)
          .map((ct: any) => ({
            id: ct.id,
            name: ct.name,
            email: ct.email || '',
            phone: ct.phone || '',
          })),
      })),
      projects: (projs || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        clientId: p.client_id || '',
        analystId: p.analyst_id || '',
        statusId: p.status_id || '',
        implStart: p.impl_start || undefined,
        implEnd: p.impl_end || undefined,
        trainStart: p.train_start || undefined,
        trainEnd: p.train_end || undefined,
        opStart: p.op_start || undefined,
        opEnd: p.op_end || undefined,
      })),
      projectStatuses: (statuses || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        color: s.color,
      })),
      columns: (cols || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        archived: c.archived,
      })),
      categories: (cats || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        color: c.color,
      })),
      attachmentTags: (attachmentTags || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        color: t.color,
      })),
      tasks: (tasks || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        clientId: t.client_id || '',
        projectId: t.project_id || '',
        responsibleId: t.responsible_id || '',
        priority: t.priority as any,
        categoryId: t.category_id || undefined,
        columnId: t.column_id || '',
        description: t.description || '',
        startDate: t.start_date || undefined,
        endDate: t.end_date || undefined,
        dueDate: t.due_date || undefined,
        createdAt: t.created_at || new Date().toISOString(),
        checklist: (subtasks || [])
          .filter((st: any) => st.task_id === t.id)
          .map((st: any) => ({
            id: st.id,
            title: st.title,
            completed: st.completed,
          })),
        attachments: (attachments || [])
          .filter((a: any) => a.task_id === t.id)
          .map((a: any) => ({
            id: a.id,
            name: a.name,
            size: a.size || 0,
            type: a.type || '',
            url: a.url || '',
            createdAt: a.created_at || new Date().toISOString(),
            tagIds: (taskTags || [])
              .filter((tt: any) => tt.attachment_id === a.id)
              .map((tt: any) => tt.tag_id),
          })),
        timeEntries: (timeEntries || [])
          .filter((te: any) => te.task_id === t.id)
          .map((te: any) => ({
            id: te.id,
            start: te.start_time,
            end: te.end_time || '',
            observation: te.observation || '',
          })),
      })),
    }))
  } catch (err) {
    console.error('Failed to load initial data', err)
  } finally {
    isFetching = false
  }
}

function generateUUID() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
}

export default function useMainStore() {
  const state = useSyncExternalStore(
    (l) => store.subscribe(l),
    () => store.state,
  )

  useEffect(() => {
    loadInitialData()
  }, [])

  return {
    ...state,
    updateTask: (id: string, payload: Partial<Task>) => {
      store.setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...payload } : t)),
      }))

      const dbPayload: any = {}
      if ('title' in payload) dbPayload.title = payload.title
      if ('clientId' in payload) dbPayload.client_id = payload.clientId || null
      if ('projectId' in payload) dbPayload.project_id = payload.projectId || null
      if ('responsibleId' in payload) dbPayload.responsible_id = payload.responsibleId || null
      if ('priority' in payload) dbPayload.priority = payload.priority
      if ('categoryId' in payload) dbPayload.category_id = payload.categoryId || null
      if ('columnId' in payload) dbPayload.column_id = payload.columnId || null
      if ('description' in payload) dbPayload.description = payload.description || null
      if ('dueDate' in payload) dbPayload.due_date = payload.dueDate || null

      if (Object.keys(dbPayload).length > 0) {
        supabase
          .from('tasks')
          .update(dbPayload)
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('Error updating task:', error)
          })
      }

      if (payload.checklist) {
        supabase
          .from('subtasks')
          .delete()
          .eq('task_id', id)
          .then(({ error }) => {
            if (error) console.error('Error deleting subtasks:', error)
            if (payload.checklist && payload.checklist.length > 0) {
              supabase
                .from('subtasks')
                .insert(
                  payload.checklist.map((c) => ({
                    id: c.id || generateUUID(),
                    task_id: id,
                    title: c.title,
                    completed: c.completed,
                  })),
                )
                .then(({ error }) => {
                  if (error) console.error('Error inserting subtasks:', error)
                })
            }
          })
      }

      if (payload.timeEntries) {
        supabase
          .from('time_entries')
          .delete()
          .eq('task_id', id)
          .then(({ error }) => {
            if (error) console.error('Error deleting time entries:', error)
            if (payload.timeEntries && payload.timeEntries.length > 0) {
              supabase
                .from('time_entries')
                .insert(
                  payload.timeEntries.map((t) => ({
                    id: t.id || generateUUID(),
                    task_id: id,
                    start_time: t.start,
                    end_time: t.end || null,
                    observation: t.observation || null,
                  })),
                )
                .then(({ error }) => {
                  if (error) console.error('Error inserting time entries:', error)
                })
            }
          })
      }

      if (payload.attachments) {
        supabase
          .from('attachments')
          .delete()
          .eq('task_id', id)
          .then(({ error }) => {
            if (error) console.error('Error deleting attachments:', error)
            if (payload.attachments && payload.attachments.length > 0) {
              supabase
                .from('attachments')
                .insert(
                  payload.attachments.map((a) => ({
                    id: a.id,
                    task_id: id,
                    name: a.name,
                    size: a.size,
                    type: a.type,
                    url: a.url,
                    created_at: a.createdAt,
                  })),
                )
                .then(({ error }) => {
                  if (error) console.error('Error inserting attachments:', error)
                  const tagsToInsert = payload.attachments!.flatMap((a) =>
                    (a.tagIds || []).map((tid) => ({ attachment_id: a.id, tag_id: tid })),
                  )
                  if (tagsToInsert.length > 0) {
                    supabase
                      .from('task_attachment_tags')
                      .insert(tagsToInsert)
                      .then(({ error }) => {
                        if (error) console.error('Error inserting attachment tags:', error)
                      })
                  }
                })
            }
          })
      }
    },
    addTask: (task: Task) => {
      store.setState((s) => ({ ...s, tasks: [...s.tasks, task] }))
      supabase
        .from('tasks')
        .insert({
          id: task.id,
          title: task.title,
          client_id: task.clientId || null,
          project_id: task.projectId || null,
          responsible_id: task.responsibleId || null,
          priority: task.priority,
          category_id: task.categoryId || null,
          column_id: task.columnId || null,
          description: task.description || null,
          due_date: task.dueDate || null,
          created_at: task.createdAt || new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error('Error adding task:', error)
        })
    },
    addCategory: (category: Omit<Category, 'id'>) => {
      const id = `cat-${Math.random().toString(36).substr(2, 9)}`
      store.setState((s) => ({ ...s, categories: [...s.categories, { ...category, id }] }))
      supabase.from('categories').insert({ id, name: category.name, color: category.color }).then()
      return id
    },
    updateCategory: (id: string, payload: Partial<Category>) => {
      store.setState((s) => ({
        ...s,
        categories: s.categories.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      }))
      supabase
        .from('categories')
        .update({ name: payload.name, color: payload.color })
        .eq('id', id)
        .then()
    },
    deleteCategory: (id: string) => {
      store.setState((s) => ({
        ...s,
        categories: s.categories.filter((c) => c.id !== id),
        tasks: s.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: undefined } : t)),
      }))
      supabase.from('categories').delete().eq('id', id).then()
    },
    addUser: (user: User) => store.setState((s) => ({ ...s, users: [...s.users, user] })),
    updateUser: (id: string, payload: Partial<User>) =>
      store.setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === id ? { ...u, ...payload } : u)),
      })),
    deleteUser: (id: string) =>
      store.setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) })),
    addClient: (client: Client) => {
      const id = client.id || generateUUID()
      const newClient = { ...client, id }
      store.setState((s) => ({ ...s, clients: [...s.clients, newClient] }))
      supabase
        .from('clients')
        .insert({
          id,
          name: client.name,
          cnpj: client.cnpj,
          logo: client.logo,
          registration_date: client.registrationDate,
          website: client.website,
          server_ip: client.serverIp,
          notes: client.notes,
          modules: client.modules || [],
        })
        .then(() => {
          if (client.contacts && client.contacts.length > 0) {
            supabase
              .from('client_contacts')
              .insert(
                client.contacts.map((c) => ({
                  id: c.id || generateUUID(),
                  client_id: id,
                  name: c.name,
                  email: c.email,
                  phone: c.phone,
                })),
              )
              .then()
          }
        })
    },
    updateClient: (id: string, payload: Partial<Client>) => {
      store.setState((s) => ({
        ...s,
        clients: s.clients.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      }))
      const dbPayload: any = {}
      if ('name' in payload) dbPayload.name = payload.name
      if ('cnpj' in payload) dbPayload.cnpj = payload.cnpj
      if ('logo' in payload) dbPayload.logo = payload.logo
      if ('registrationDate' in payload) dbPayload.registration_date = payload.registrationDate
      if ('website' in payload) dbPayload.website = payload.website
      if ('serverIp' in payload) dbPayload.server_ip = payload.serverIp
      if ('notes' in payload) dbPayload.notes = payload.notes
      if ('modules' in payload) dbPayload.modules = payload.modules

      if (Object.keys(dbPayload).length > 0) {
        supabase.from('clients').update(dbPayload).eq('id', id).then()
      }

      if (payload.contacts) {
        supabase
          .from('client_contacts')
          .delete()
          .eq('client_id', id)
          .then(() => {
            if (payload.contacts && payload.contacts.length > 0) {
              supabase
                .from('client_contacts')
                .insert(
                  payload.contacts.map((c) => ({
                    id: c.id || generateUUID(),
                    client_id: id,
                    name: c.name,
                    email: c.email,
                    phone: c.phone,
                  })),
                )
                .then()
            }
          })
      }
    },
    deleteClient: (id: string) => {
      store.setState((s) => ({
        ...s,
        clients: s.clients.filter((c) => c.id !== id),
        tasks: s.tasks.map((t) => (t.clientId === id ? { ...t, clientId: '', projectId: '' } : t)),
        projects: s.projects.filter((p) => p.clientId !== id),
      }))
      supabase.from('clients').delete().eq('id', id).then()
    },
    addProject: (project: Project) => {
      const id = project.id || generateUUID()
      store.setState((s) => ({ ...s, projects: [...s.projects, { ...project, id }] }))
      supabase
        .from('projects')
        .insert({
          id,
          name: project.name,
          client_id: project.clientId || null,
          analyst_id: project.analystId || null,
          status_id: project.statusId || null,
          impl_start: project.implStart,
          impl_end: project.implEnd,
          train_start: project.trainStart,
          train_end: project.trainEnd,
          op_start: project.opStart,
          op_end: project.opEnd,
        })
        .then()
    },
    updateProject: (id: string, payload: Partial<Project>) => {
      store.setState((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === id ? { ...p, ...payload } : p)),
      }))
      const dbPayload: any = {}
      if ('name' in payload) dbPayload.name = payload.name
      if ('clientId' in payload) dbPayload.client_id = payload.clientId || null
      if ('analystId' in payload) dbPayload.analyst_id = payload.analystId || null
      if ('statusId' in payload) dbPayload.status_id = payload.statusId || null
      if ('implStart' in payload) dbPayload.impl_start = payload.implStart
      if ('implEnd' in payload) dbPayload.impl_end = payload.implEnd
      if ('trainStart' in payload) dbPayload.train_start = payload.trainStart
      if ('trainEnd' in payload) dbPayload.train_end = payload.trainEnd
      if ('opStart' in payload) dbPayload.op_start = payload.opStart
      if ('opEnd' in payload) dbPayload.op_end = payload.opEnd

      if (Object.keys(dbPayload).length > 0) {
        supabase.from('projects').update(dbPayload).eq('id', id).then()
      }
    },
    deleteProject: (id: string) => {
      store.setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) }))
      supabase.from('projects').delete().eq('id', id).then()
    },
    addProjectStatus: (status: Omit<ProjectStatus, 'id'>) => {
      const id = `ps-${Math.random().toString(36).substr(2, 9)}`
      store.setState((s) => ({ ...s, projectStatuses: [...s.projectStatuses, { ...status, id }] }))
      supabase
        .from('project_statuses')
        .insert({ id, name: status.name, color: status.color })
        .then()
      return id
    },
    updateProjectStatus: (id: string, payload: Partial<ProjectStatus>) => {
      store.setState((s) => ({
        ...s,
        projectStatuses: s.projectStatuses.map((ps) => (ps.id === id ? { ...ps, ...payload } : ps)),
      }))
      supabase
        .from('project_statuses')
        .update({ name: payload.name, color: payload.color })
        .eq('id', id)
        .then()
    },
    deleteProjectStatus: (id: string, fallbackId?: string) => {
      store.setState((s) => ({
        ...s,
        projectStatuses: s.projectStatuses.filter((ps) => ps.id !== id),
        projects: s.projects.map((p) =>
          p.statusId === id
            ? {
                ...p,
                statusId: fallbackId || s.projectStatuses.find((st) => st.id !== id)?.id || '',
              }
            : p,
        ),
      }))
      if (fallbackId) {
        supabase
          .from('projects')
          .update({ status_id: fallbackId })
          .eq('status_id', id)
          .then(() => {
            supabase.from('project_statuses').delete().eq('id', id).then()
          })
      } else {
        supabase.from('project_statuses').delete().eq('id', id).then()
      }
    },
    addColumn: (column: Column) => {
      store.setState((s) => ({ ...s, columns: [...s.columns, column] }))
      supabase
        .from('columns')
        .insert({
          id: column.id,
          title: column.title,
          archived: column.archived || false,
          position: store.state.columns.length,
        })
        .then(({ error }) => {
          if (error) console.error('Error adding column:', error)
        })
    },
    updateColumn: (id: string, payload: Partial<Column>) => {
      store.setState((s) => ({
        ...s,
        columns: s.columns.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      }))
      const dbPayload: any = {}
      if ('title' in payload) dbPayload.title = payload.title
      if ('archived' in payload) dbPayload.archived = payload.archived
      if (Object.keys(dbPayload).length > 0) {
        supabase
          .from('columns')
          .update(dbPayload)
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.error('Error updating column:', error)
          })
      }
    },
    deleteColumn: (id: string) => {
      store.setState((s) => ({ ...s, columns: s.columns.filter((c) => c.id !== id) }))
      supabase
        .from('columns')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting column:', error)
        })
    },
    reorderColumns: (startIndex: number, endIndex: number) => {
      store.setState((s) => {
        const newCols = Array.from(s.columns)
        const [removed] = newCols.splice(startIndex, 1)
        newCols.splice(endIndex, 0, removed)
        Promise.all(
          newCols.map((c, i) => supabase.from('columns').update({ position: i }).eq('id', c.id)),
        ).then()
        return { ...s, columns: newCols }
      })
    },
    restoreColumn: (id: string) => {
      store.setState((s) => {
        const colIndex = s.columns.findIndex((c) => c.id === id)
        if (colIndex === -1) return s
        const col = s.columns[colIndex]
        const newCols = Array.from(s.columns)
        newCols.splice(colIndex, 1)
        newCols.push({ ...col, archived: false })
        supabase
          .from('columns')
          .update({ archived: false, position: newCols.length - 1 })
          .eq('id', id)
          .then()
        return { ...s, columns: newCols }
      })
    },
    addAttachmentTag: (tag: Omit<AttachmentTag, 'id'>) => {
      const id = `at-${Math.random().toString(36).substr(2, 9)}`
      store.setState((s) => ({ ...s, attachmentTags: [...s.attachmentTags, { ...tag, id }] }))
      supabase.from('attachment_tags').insert({ id, name: tag.name, color: tag.color }).then()
      return id
    },
    updateAttachmentTag: (id: string, payload: Partial<AttachmentTag>) => {
      store.setState((s) => ({
        ...s,
        attachmentTags: s.attachmentTags.map((t) => (t.id === id ? { ...t, ...payload } : t)),
      }))
      supabase
        .from('attachment_tags')
        .update({ name: payload.name, color: payload.color })
        .eq('id', id)
        .then()
    },
    deleteAttachmentTag: (id: string) => {
      store.setState((s) => ({
        ...s,
        attachmentTags: s.attachmentTags.filter((t) => t.id !== id),
        tasks: s.tasks.map((t) => ({
          ...t,
          attachments: (t.attachments || []).map((a) => ({
            ...a,
            tagIds: (a.tagIds || []).filter((tid) => tid !== id),
          })),
        })),
      }))
      supabase.from('attachment_tags').delete().eq('id', id).then()
    },
  }
}
