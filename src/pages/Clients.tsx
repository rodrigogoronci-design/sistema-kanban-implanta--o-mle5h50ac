import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ClientFormModal } from '@/components/ClientFormModal'
import { ClientStatusManagementModal } from '@/components/ClientStatusManagementModal'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, ExternalLink, Pencil, Trash2, Building2, Settings2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [contacts, setContacts] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [clientStatuses, setClientStatuses] = useState<any[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    const [clientsRes, contactsRes, tasksRes, columnsRes, statusesRes] = await Promise.all([
      supabase.from('clients').select('*').order('name'),
      supabase.from('client_contacts').select('*'),
      supabase.from('tasks').select('*'),
      supabase.from('columns').select('*'),
      supabase.from('client_statuses').select('*').order('name'),
    ])

    if (clientsRes.data) setClients(clientsRes.data)
    if (contactsRes.data) setContacts(contactsRes.data)
    if (tasksRes.data) setTasks(tasksRes.data)
    if (columnsRes.data) setColumns(columnsRes.data)
    if (statusesRes.data) setClientStatuses(statusesRes.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAdd = () => {
    setSelectedClient(null)
    setModalOpen(true)
  }

  const handleEdit = (client: any) => {
    const clientContacts = contacts
      .filter((c) => c.client_id === client.id)
      .map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
      }))

    setSelectedClient({
      id: client.id,
      name: client.name,
      cnpj: client.cnpj,
      website: client.website,
      logo: client.logo,
      registrationDate: client.registration_date,
      serverIp: client.server_ip,
      notes: client.notes,
      modules: client.modules,
      contacts: clientContacts,
      statusId: client.status_id,
    })
    setModalOpen(true)
  }

  const handleSave = async (data: any) => {
    try {
      let clientId = selectedClient?.id

      const clientPayload = {
        name: data.name,
        cnpj: data.cnpj || null,
        website: data.website || null,
        logo: data.logo || null,
        registration_date: data.registrationDate || null,
        server_ip: data.serverIp || null,
        notes: data.notes || null,
        modules: data.modules || [],
        status_id: data.statusId || null,
      }

      if (clientId) {
        const { error } = await supabase.from('clients').update(clientPayload).eq('id', clientId)
        if (error) throw error
      } else {
        const { data: newClient, error } = await supabase
          .from('clients')
          .insert([clientPayload])
          .select()
          .single()
        if (error) throw error
        clientId = newClient.id
      }

      if (clientId) {
        await supabase.from('client_contacts').delete().eq('client_id', clientId)
        if (data.contacts && data.contacts.length > 0) {
          const contactsPayload = data.contacts.map((c: any) => ({
            client_id: clientId,
            name: c.name,
            email: c.email || null,
            phone: c.phone || null,
          }))
          const { error: contactsError } = await supabase
            .from('client_contacts')
            .insert(contactsPayload)
          if (contactsError) throw contactsError
        }
      }

      toast({ title: 'Sucesso', description: 'Cliente salvo com sucesso!' })
      setModalOpen(false)
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cliente?')) return
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Sucesso', description: 'Cliente excluído com sucesso!' })
      fetchData()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-fade-in-up">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setStatusModalOpen(true)}>
            <Settings2 className="mr-2 h-4 w-4" /> Gerenciar Status
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Cliente</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border bg-muted/50 shadow-sm rounded-md p-0.5">
                        <AvatarImage
                          src={client.logo || ''}
                          alt={client.name}
                          className="object-contain mix-blend-multiply"
                        />
                        <AvatarFallback className="rounded-md bg-transparent">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{client.name}</span>
                        {client.website && (
                          <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {client.website}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {client.cnpj || '-'}
                  </TableCell>
                  <TableCell>
                    {client.status_id ? (
                      (() => {
                        const status = clientStatuses.find((s) => s.id === client.status_id)
                        if (!status)
                          return (
                            <Badge variant="outline" className="font-normal bg-muted/20">
                              -
                            </Badge>
                          )
                        return (
                          <Badge
                            variant="outline"
                            className="font-normal"
                            style={{
                              backgroundColor: `${status.color}20`,
                              color: status.color,
                              borderColor: `${status.color}50`,
                            }}
                          >
                            <div
                              className="w-1.5 h-1.5 rounded-full mr-2"
                              style={{ backgroundColor: status.color }}
                            />
                            {status.name}
                          </Badge>
                        )
                      })()
                    ) : (
                      <Badge variant="outline" className="font-normal bg-muted/20">
                        -
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {client.website && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          asChild
                        >
                          <a
                            href={
                              client.website.startsWith('http')
                                ? client.website
                                : `https://${client.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Acessar Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(client)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ClientFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        client={selectedClient}
        clientStatuses={clientStatuses}
        onSubmit={handleSave}
      />

      <ClientStatusManagementModal
        open={statusModalOpen}
        onOpenChange={setStatusModalOpen}
        clientStatuses={clientStatuses}
        clients={clients}
        onSuccess={fetchData}
      />
    </div>
  )
}
