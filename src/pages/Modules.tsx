import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Edit2, Trash2, Package, Users, RefreshCw, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Module = {
  id: string
  name: string
  created_at: string
}

type Client = {
  id: string
  name: string
  modules: string[] | null
}

class ModulesErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ModulesErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 bg-background min-h-[400px] rounded-lg border">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-bold">Erro ao exibir página</h2>
          <p className="text-muted-foreground max-w-md">
            Erro ao carregar o gerenciamento de módulos. Por favor, tente novamente.
            {this.state.error?.message && (
              <span className="block mt-2 text-sm text-destructive font-mono bg-destructive/10 p-2 rounded">
                {this.state.error.message}
              </span>
            )}
          </p>
          <Button variant="outline" onClick={() => this.setState({ hasError: false, error: null })}>
            <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

function ModulesContent() {
  const { toast } = useToast()
  const [modules, setModules] = useState<Module[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState('modules')

  // Module form state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Client modules form state
  const [isClientFormOpen, setIsClientFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setErrorState(null)

      const [modulesRes, clientsRes] = await Promise.all([
        supabase.from('modules').select('*').order('name'),
        supabase.from('clients').select('id, name, modules').order('name'),
      ])

      if (modulesRes.error) throw modulesRes.error
      if (clientsRes.error) throw clientsRes.error

      setModules(modulesRes.data || [])

      const parsedClients = (clientsRes.data || []).map((client) => {
        let clientModules: string[] = []
        if (Array.isArray(client.modules)) {
          clientModules = client.modules as string[]
        } else if (typeof client.modules === 'string') {
          try {
            const parsed = JSON.parse(client.modules)
            if (Array.isArray(parsed)) clientModules = parsed
          } catch (e) {
            console.error('Failed to parse client modules:', e)
          }
        }
        return {
          ...client,
          modules: clientModules,
        }
      })

      setClients(parsedClients)
    } catch (error: any) {
      console.error('Fetch error:', error)
      let errorMessage = error.message || 'Erro ao carregar dados do servidor.'

      // Prevent network/JSON parsing errors from crashing or causing misleading UI
      if (
        errorMessage.includes('Unexpected token') ||
        errorMessage.includes('Unexpected end of JSON input') ||
        errorMessage.includes('JSON') ||
        errorMessage.includes('fetch')
      ) {
        errorMessage = 'Erro de comunicação com o servidor. Resposta inválida da rede.'
      }

      setErrorState(errorMessage)
      toast({
        title: 'Erro de Conexão',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (editingId) {
        const { error } = await supabase
          .from('modules')
          .update({ name: name.trim() })
          .eq('id', editingId)
        if (error) {
          if (error.code === '23505') throw new Error('Já existe um módulo com este nome.')
          throw error
        }
        toast({ title: 'Sucesso', description: 'Módulo atualizado.' })
      } else {
        const { error } = await supabase.from('modules').insert({ name: name.trim() })
        if (error) {
          if (error.code === '23505') throw new Error('Já existe um módulo com este nome.')
          throw error
        }
        toast({ title: 'Sucesso', description: 'Módulo criado.' })
      }
      setIsFormOpen(false)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const { error } = await supabase.from('modules').delete().eq('id', deleteId)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Módulo excluído.' })
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setName('')
    setIsFormOpen(true)
  }

  const openEdit = (mod: Module) => {
    setEditingId(mod.id)
    setName(mod.name)
    setIsFormOpen(true)
  }

  const openClientEdit = (client: Client) => {
    setSelectedClient(client)
    setIsClientFormOpen(true)
  }

  const handleClientModuleToggle = async (clientId: string, moduleId: string, checked: boolean) => {
    try {
      const client = clients.find((c) => c.id === clientId)
      if (!client) return

      const currentModules = client.modules || []
      let newModules: string[]

      if (checked) {
        newModules = [...new Set([...currentModules, moduleId])]
      } else {
        newModules = currentModules.filter((id) => id !== moduleId)
      }

      setClients(clients.map((c) => (c.id === clientId ? { ...c, modules: newModules } : c)))
      setSelectedClient((prev) =>
        prev && prev.id === clientId ? { ...prev, modules: newModules } : prev,
      )

      const { error } = await supabase
        .from('clients')
        .update({ modules: newModules })
        .eq('id', clientId)

      if (error) {
        setClients(clients.map((c) => (c.id === clientId ? { ...c, modules: currentModules } : c)))
        setSelectedClient((prev) =>
          prev && prev.id === clientId ? { ...prev, modules: currentModules } : prev,
        )
        throw error
      }
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  if (errorState && !modules.length && !clients.length) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center space-y-4 bg-background min-h-[400px] rounded-lg border">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-2xl font-bold">Erro ao carregar dados</h2>
        <p className="text-muted-foreground max-w-md">
          Não foi possível sincronizar com o banco de dados.
        </p>
        <span className="block mt-2 text-sm text-destructive font-mono bg-destructive/10 p-2 rounded">
          {errorState}
        </span>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-8 h-8 text-primary" />
            Gestão de Módulos
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os módulos do sistema e vincule aos clientes.
          </p>
        </div>
        {activeTab === 'modules' && (
          <Button onClick={openCreate} className="w-full sm:w-auto shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Módulo
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="w-4 h-4" /> Módulos
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Módulos por Cliente
          </TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Módulos Cadastrados</CardTitle>
              <CardDescription>
                Lista de todos os módulos de treinamento do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : modules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nenhum módulo encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      modules.map((mod) => (
                        <TableRow key={mod.id}>
                          <TableCell className="font-medium">{mod.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {mod.created_at
                              ? format(new Date(mod.created_at), 'dd/MM/yyyy HH:mm', {
                                  locale: ptBR,
                                })
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Editar"
                                onClick={() => openEdit(mod)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Excluir"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteId(mod.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Vincular Módulos</CardTitle>
              <CardDescription>
                Atribua módulos específicos a cada cliente cadastrado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Módulos Vinculados</TableHead>
                      <TableHead className="w-[100px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nenhum cliente encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {client.modules && client.modules.length > 0 ? (
                                client.modules.map((modId) => {
                                  const mod = modules.find((m) => m.id === modId)
                                  return mod ? (
                                    <span
                                      key={modId}
                                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                                    >
                                      {mod.name}
                                    </span>
                                  ) : null
                                })
                              ) : (
                                <span className="text-xs text-muted-foreground">Nenhum módulo</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openClientEdit(client)}
                            >
                              Gerenciar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Módulo' : 'Adicionar Módulo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Módulo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Módulo Básico"
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Client Modules form */}
      <Dialog open={isClientFormOpen} onOpenChange={setIsClientFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Módulos do Cliente</DialogTitle>
            <DialogDescription>
              Selecione os módulos disponíveis para {selectedClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {modules.map((mod) => {
              const isChecked = selectedClient?.modules?.includes(mod.id) || false
              return (
                <div
                  key={mod.id}
                  className="flex items-center space-x-3 rounded-lg border p-4 shadow-sm hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={`mod-${mod.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleClientModuleToggle(selectedClient!.id, mod.id, !!checked)
                    }
                  />
                  <div className="space-y-1 leading-none flex-1">
                    <Label htmlFor={`mod-${mod.id}`} className="font-medium cursor-pointer block">
                      {mod.name}
                    </Label>
                  </div>
                </div>
              )
            })}
            {modules.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum módulo cadastrado no sistema.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClientFormOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function Modules() {
  return (
    <ModulesErrorBoundary>
      <ModulesContent />
    </ModulesErrorBoundary>
  )
}
