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
export type ProjectPhase =
  | 'Configuração do Sistema'
  | 'Em treinamento'
  | 'Operação Assistida'
  | 'Concluído'

export interface Project {
  id: string
  name: string
  clientId: string
  analystId: string
  phase: ProjectPhase
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
  end?: string
  duration?: number
}
export interface Task {
  id: string
  title: string
  clientId: string
  projectId: string
  responsibleId: string
  priority: 'Baixa' | 'Média' | 'Alta'
  category: string
  columnId: string
  description: string
  checklist: Subtask[]
  startDate?: string
  endDate?: string
  timeEntries: TimeEntry[]
}
export interface Column {
  id: string
  title: string
}

export interface MainState {
  users: User[]
  clients: Client[]
  projects: Project[]
  tasks: Task[]
  columns: Column[]
}

const initialMockState: MainState = {
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
      phase: 'Configuração do Sistema',
      implStart: '2024-05-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Migração RH Globex',
      clientId: '2',
      analystId: '2',
      phase: 'Em treinamento',
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
      category: 'Consultoria',
      columnId: 'in-progress',
      description: 'Realizar reuniões com as áreas chaves.',
      checklist: [
        { id: 'c1', title: 'Reunião Financeiro', completed: true },
        { id: 'c2', title: 'Reunião Estoque', completed: false },
      ],
      timeEntries: [],
    },
    {
      id: '2',
      title: 'Configuração Servidor DB',
      clientId: '1',
      projectId: '1',
      responsibleId: '2',
      priority: 'Alta',
      category: 'Infraestrutura',
      columnId: 'backlog',
      description: 'Provisionar RDS na AWS.',
      checklist: [],
      timeEntries: [],
    },
    {
      id: '3',
      title: 'Treinamento Modulo Folha',
      clientId: '2',
      projectId: '2',
      responsibleId: '3',
      priority: 'Média',
      category: 'Treinamento',
      columnId: 'training',
      description: 'Capacitar analistas de RH.',
      checklist: [],
      timeEntries: [
        { id: 't1', start: '2024-05-01T10:00:00Z', end: '2024-05-01T12:00:00Z', duration: 7200 },
      ],
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
      store.setState((s) => ({ ...s, clients: s.clients.filter((c) => c.id !== id) })),
    addProject: (project: Project) =>
      store.setState((s) => ({ ...s, projects: [...s.projects, project] })),
    updateProject: (id: string, payload: Partial<Project>) =>
      store.setState((s) => ({
        ...s,
        projects: s.projects.map((p) => (p.id === id ? { ...p, ...payload } : p)),
      })),
    deleteProject: (id: string) =>
      store.setState((s) => ({ ...s, projects: s.projects.filter((p) => p.id !== id) })),
  }
}
