import { useSyncExternalStore } from 'react'

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
}

const initialMockState: MainState = {
  projectStatuses: [
    { id: 'ps-1', name: 'Backlog', color: '#94a3b8' },
    { id: 'ps-2', name: 'Em andamento', color: '#3b82f6' },
    { id: 'ps-3', name: 'Aguardando cliente', color: '#f59e0b' },
    { id: 'ps-4', name: 'Aguardando Desenvolvimento', color: '#8b5cf6' },
    { id: 'ps-5', name: 'Concluido', color: '#10b981' },
  ],
  categories: [
    { id: 'cat-1', name: 'Consultoria', color: '#3b82f6' },
    { id: 'cat-2', name: 'Infraestrutura', color: '#10b981' },
    { id: 'cat-3', name: 'Treinamento', color: '#f59e0b' },
    { id: 'cat-4', name: 'Implantação', color: '#8b5cf6' },
    { id: 'cat-5', name: 'Suporte', color: '#ef4444' },
  ],
  users: [
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana@example.com',
      phone: '(11) 99999-9999',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1',
    },
    {
      id: '2',
      name: 'Carlos Costa',
      email: 'carlos@example.com',
      phone: '(11) 88888-8888',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
    },
    {
      id: '3',
      name: 'Beatriz Santos',
      email: 'beatriz@example.com',
      phone: '(11) 77777-7777',
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
    },
  ],
  clients: [
    {
      id: '1',
      name: 'Acme Corp',
      cnpj: '00.000.000/0001-00',
      contacts: [
        { id: 'c1', name: 'João Diretor', email: 'joao@acme.com', phone: '(11) 9999-9999' },
      ],
      modules: ['ERP Financeiro', 'CRM Vendas'],
      logo: 'https://img.usecurling.com/i?q=acme&shape=fill&color=blue',
      website: 'www.acme.com',
      serverIp: '192.168.1.100',
      notes: 'Cliente prioritário na fase de configuração.',
    },
    {
      id: '2',
      name: 'Globex Ind',
      cnpj: '11.111.111/0001-11',
      contacts: [
        { id: 'c2', name: 'Maria Gerente', email: 'maria@globex.com', phone: '(11) 8888-8888' },
      ],
      modules: ['RH', 'Folha'],
      logo: 'https://img.usecurling.com/i?q=globex&shape=fill&color=red',
      website: 'www.globex.com',
      serverIp: '10.0.0.5',
      notes: 'Treinamento agendado para o próximo mês.',
    },
  ],
  projects: [
    {
      id: '1',
      name: 'Implantação ERP Acme',
      clientId: '1',
      analystId: '1',
      statusId: 'ps-2',
      implStart: '2024-05-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Migração RH Globex',
      clientId: '2',
      analystId: '2',
      statusId: 'ps-3',
      implStart: '2024-06-15T00:00:00Z',
    },
  ],
  columns: [
    { id: 'backlog', title: 'A Fazer' },
    { id: 'in-progress', title: 'Em Andamento' },
    { id: 'training', title: 'Treinamento' },
    { id: 'done', title: 'Concluído' },
  ],
  tasks: [
    {
      id: '1',
      title: 'Mapeamento de Processos',
      clientId: '1',
      projectId: '1',
      responsibleId: '1',
      priority: 'Alta',
      categoryId: 'cat-1',
      columnId: 'in-progress',
      description: 'Realizar reuniões com as áreas chaves.',
      checklist: [
        { id: 'c1', title: 'Reunião Financeiro', completed: true },
        { id: 'c2', title: 'Reunião Estoque', completed: false },
      ],
      timeEntries: [],
      createdAt: '2024-04-01T10:00:00Z',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '2',
      title: 'Configuração Servidor DB',
      clientId: '1',
      projectId: '1',
      responsibleId: '2',
      priority: 'Alta',
      categoryId: 'cat-2',
      columnId: 'backlog',
      description: 'Provisionar RDS na AWS.',
      checklist: [],
      timeEntries: [],
      createdAt: '2024-04-02T10:00:00Z',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: '3',
      title: 'Treinamento Modulo Folha',
      clientId: '2',
      projectId: '2',
      responsibleId: '3',
      priority: 'Média',
      categoryId: 'cat-3',
      columnId: 'training',
      description: 'Capacitar analistas de RH.',
      checklist: [],
      timeEntries: [
        {
          id: 't1',
          start: '2024-05-01T10:00',
          end: '2024-05-01T12:00',
          observation: 'Treinamento inicial das funcionalidades.',
        },
      ],
      createdAt: '2024-04-03T10:00:00Z',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    },
  ],
}

class Store {
  state: MainState
  listeners: Set<() => void>

  constructor() {
    this.state = initialMockState
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

export default function useMainStore() {
  const state = useSyncExternalStore(
    (l) => store.subscribe(l),
    () => store.state,
  )
  return {
    ...state,
    updateTask: (id: string, payload: Partial<Task>) =>
      store.setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...payload } : t)),
      })),
    addTask: (task: Task) => store.setState((s) => ({ ...s, tasks: [...s.tasks, task] })),
    addCategory: (category: Omit<Category, 'id'>) => {
      const id = `cat-${Math.random().toString(36).substr(2, 9)}`
      store.setState((s) => ({ ...s, categories: [...s.categories, { ...category, id }] }))
      return id
    },
    updateCategory: (id: string, payload: Partial<Category>) =>
      store.setState((s) => ({
        ...s,
        categories: s.categories.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      })),
    deleteCategory: (id: string) =>
      store.setState((s) => ({
        ...s,
        categories: s.categories.filter((c) => c.id !== id),
        tasks: s.tasks.map((t) => (t.categoryId === id ? { ...t, categoryId: undefined } : t)),
      })),
    addUser: (user: User) => store.setState((s) => ({ ...s, users: [...s.users, user] })),
    updateUser: (id: string, payload: Partial<User>) =>
      store.setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === id ? { ...u, ...payload } : u)),
      })),
    deleteUser: (id: string) =>
      store.setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) })),
    addClient: (client: Client) =>
      store.setState((s) => ({ ...s, clients: [...s.clients, client] })),
    updateClient: (id: string, payload: Partial<Client>) =>
      store.setState((s) => ({
        ...s,
        clients: s.clients.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      })),
    deleteClient: (id: string) =>
      store.setState((s) => ({
        ...s,
        clients: s.clients.filter((c) => c.id !== id),
        tasks: s.tasks.map((t) => (t.clientId === id ? { ...t, clientId: '', projectId: '' } : t)),
        projects: s.projects.filter((p) => p.clientId !== id),
      })),
    addProject: (project: Project) =>
      store.setState((s) => ({ ...s, projects: [...s.projects, project] })),
    updateProject: (id: string, payload: Partial<Project>) =>
      store.setState((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === id ? { ...p, ...payload } : p)),
      })),
    deleteProject: (id: string) =>
      store.setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) })),
    addProjectStatus: (status: Omit<ProjectStatus, 'id'>) => {
      const id = `ps-${Math.random().toString(36).substr(2, 9)}`
      store.setState((s) => ({ ...s, projectStatuses: [...s.projectStatuses, { ...status, id }] }))
      return id
    },
    updateProjectStatus: (id: string, payload: Partial<ProjectStatus>) =>
      store.setState((s) => ({
        ...s,
        projectStatuses: s.projectStatuses.map((ps) => (ps.id === id ? { ...ps, ...payload } : ps)),
      })),
    deleteProjectStatus: (id: string, fallbackId?: string) =>
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
      })),
    addColumn: (column: Column) =>
      store.setState((s) => ({ ...s, columns: [...s.columns, column] })),
    updateColumn: (id: string, payload: Partial<Column>) =>
      store.setState((s) => ({
        ...s,
        columns: s.columns.map((c) => (c.id === id ? { ...c, ...payload } : c)),
      })),
    deleteColumn: (id: string) =>
      store.setState((s) => ({ ...s, columns: s.columns.filter((c) => c.id !== id) })),
    reorderColumns: (startIndex: number, endIndex: number) =>
      store.setState((s) => {
        const newCols = Array.from(s.columns)
        const [removed] = newCols.splice(startIndex, 1)
        newCols.splice(endIndex, 0, removed)
        return { ...s, columns: newCols }
      }),
    restoreColumn: (id: string) =>
      store.setState((s) => {
        const colIndex = s.columns.findIndex((c) => c.id === id)
        if (colIndex === -1) return s
        const col = s.columns[colIndex]
        const newCols = Array.from(s.columns)
        newCols.splice(colIndex, 1)
        newCols.push({ ...col, archived: false })
        return { ...s, columns: newCols }
      }),
  }
}
