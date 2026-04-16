import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Client } from '@/stores/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useMainStore from '@/stores/main'
import { getTaskHours } from '@/lib/time'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, parseISO } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2 } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
  onSubmit: (data: Omit<Client, 'id'>) => void
}

export function ClientFormModal({ open, onOpenChange, client, onSubmit }: Props) {
  const [formData, setFormData] = useState<Partial<Client>>({})
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '' })
  const { projects, tasks, projectStatuses } = useMainStore()

  useEffect(() => {
    if (client) {
      setFormData(client)
    } else {
      setFormData({ name: '', cnpj: '', website: '', logo: '', contacts: [], modules: [] })
    }
    setNewContact({ name: '', email: '', phone: '' })
  }, [client, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return
    onSubmit({
      name: formData.name,
      cnpj: formData.cnpj || '',
      website: formData.website || '',
      logo:
        formData.logo ||
        `https://img.usecurling.com/i?q=${encodeURIComponent(formData.name)}&shape=fill&color=blue`,
      contacts: formData.contacts || [],
      modules: formData.modules || [],
      serverIp: formData.serverIp,
      notes: formData.notes,
    })
  }

  const handleAddContact = () => {
    if (!newContact.name.trim()) return
    setFormData((prev) => ({
      ...prev,
      contacts: [...(prev.contacts || []), { id: `c-${Date.now()}`, ...newContact }],
    }))
    setNewContact({ name: '', email: '', phone: '' })
  }

  const handleRemoveContact = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      contacts: (prev.contacts || []).filter((c) => c.id !== id),
    }))
  }

  const clientProjects = client ? projects.filter((p) => p.clientId === client.id) : []
  const clientTasks = client ? tasks.filter((t) => t.clientId === client.id) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] p-0 flex flex-col overflow-hidden bg-background">
        <div className="p-6 pb-4 border-b bg-muted/20 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {client ? `Cliente: ${client.name}` : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
            <div className="px-6 pt-4 shrink-0 border-b">
              <TabsList className="w-full justify-start rounded-none border-b-0 bg-transparent p-0 overflow-x-auto">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 pb-2 pt-2"
                >
                  Detalhes
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 pb-2 pt-2"
                >
                  Contatos
                </TabsTrigger>
                {client && (
                  <>
                    <TabsTrigger
                      value="projects"
                      className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 pb-2 pt-2"
                    >
                      Projetos
                    </TabsTrigger>
                    <TabsTrigger
                      value="tasks"
                      className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 pb-2 pt-2"
                    >
                      Atividades
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <TabsContent value="details" className="mt-0 space-y-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nome da Empresa *</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Ex: Acme Corp"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input
                            id="cnpj"
                            value={formData.cnpj || ''}
                            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                            placeholder="00.000.000/0001-00"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={formData.website || ''}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="www.exemplo.com.br"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="logo">URL do Logo</Label>
                        <Input
                          id="logo"
                          value={formData.logo || ''}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contacts" className="mt-0 space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="grid gap-2 flex-1 w-full">
                          <Label>Nome do Contato</Label>
                          <Input
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                            placeholder="Nome"
                          />
                        </div>
                        <div className="grid gap-2 flex-1 w-full">
                          <Label>E-mail</Label>
                          <Input
                            type="email"
                            value={newContact.email}
                            onChange={(e) =>
                              setNewContact({ ...newContact, email: e.target.value })
                            }
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div className="grid gap-2 flex-1 w-full">
                          <Label>Telefone</Label>
                          <Input
                            value={newContact.phone}
                            onChange={(e) =>
                              setNewContact({ ...newContact, phone: e.target.value })
                            }
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleAddContact}
                          disabled={!newContact.name.trim()}
                          className="w-full sm:w-auto"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Adicionar
                        </Button>
                      </div>

                      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead>Nome</TableHead>
                              <TableHead>E-mail</TableHead>
                              <TableHead>Telefone</TableHead>
                              <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(formData.contacts || []).map((contact) => (
                              <TableRow key={contact.id}>
                                <TableCell className="font-medium">{contact.name}</TableCell>
                                <TableCell>{contact.email}</TableCell>
                                <TableCell>{contact.phone}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive h-8 w-8 hover:bg-destructive/10"
                                    onClick={() => handleRemoveContact(contact.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                            {(!formData.contacts || formData.contacts.length === 0) && (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center py-8 text-muted-foreground"
                                >
                                  Nenhum contato cadastrado.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  {client && (
                    <>
                      <TabsContent value="projects" className="mt-0 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg tracking-tight">
                            Projetos do Cliente
                          </h3>
                          <Badge variant="secondary" className="font-mono">
                            Total:{' '}
                            {clientProjects
                              .reduce(
                                (acc, p) =>
                                  acc +
                                  tasks
                                    .filter((t) => t.projectId === p.id)
                                    .reduce((sum, t) => sum + getTaskHours(t), 0),
                                0,
                              )
                              .toFixed(1)}
                            h
                          </Badge>
                        </div>
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead>Projeto</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Horas Gastas</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientProjects.map((p) => {
                                const pTasks = tasks.filter((t) => t.projectId === p.id)
                                const hrs = pTasks.reduce((acc, t) => acc + getTaskHours(t), 0)
                                const status = projectStatuses.find((s) => s.id === p.statusId)
                                return (
                                  <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell>
                                      {status ? (
                                        <div className="flex items-center gap-2">
                                          <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: status.color }}
                                          />
                                          <span className="text-sm">{status.name}</span>
                                        </div>
                                      ) : (
                                        '-'
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">
                                      {hrs.toFixed(1)}h
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                              {clientProjects.length === 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={3}
                                    className="text-center py-8 text-muted-foreground"
                                  >
                                    Nenhum projeto associado a este cliente.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      <TabsContent value="tasks" className="mt-0 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg tracking-tight">
                            Atividades do Cliente
                          </h3>
                          <Badge variant="secondary" className="font-mono">
                            Total:{' '}
                            {clientTasks.reduce((acc, t) => acc + getTaskHours(t), 0).toFixed(1)}h
                          </Badge>
                        </div>
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/50">
                                <TableHead>Atividade</TableHead>
                                <TableHead>Prioridade</TableHead>
                                <TableHead>Data Criação</TableHead>
                                <TableHead className="text-right">Horas Gastas</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {clientTasks.map((t) => (
                                <TableRow key={t.id}>
                                  <TableCell className="font-medium">{t.title}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs font-normal">
                                      {t.priority}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-muted-foreground text-sm">
                                    {t.createdAt
                                      ? format(parseISO(t.createdAt), 'dd/MM/yyyy')
                                      : '-'}
                                  </TableCell>
                                  <TableCell className="text-right font-mono text-muted-foreground">
                                    {getTaskHours(t).toFixed(1)}h
                                  </TableCell>
                                </TableRow>
                              ))}
                              {clientTasks.length === 0 && (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center py-8 text-muted-foreground"
                                  >
                                    Nenhuma atividade registrada para este cliente.
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    </>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Tabs>

          <div className="p-4 border-t bg-muted/10 shrink-0 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Cliente</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
