import { useState } from 'react'
import useMainStore, { Client } from '@/stores/main'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Edit2, Building2 } from 'lucide-react'
import { ClientFormModal } from '@/components/ClientFormModal'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { format, parseISO } from 'date-fns'

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useMainStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>()

  const handleCreate = () => {
    setEditingClient(undefined)
    setModalOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setModalOpen(true)
  }

  const handleSubmit = (data: Omit<Client, 'id'>) => {
    if (editingClient) {
      updateClient(editingClient.id, data)
    } else {
      addClient(data as Client)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      deleteClient(id)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">Empresas e organizações em implantação.</p>
        </div>
        <Button onClick={handleCreate} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Empresa</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Contatos</TableHead>
              <TableHead>Servidor</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {client.logo ? (
                        <Avatar className="w-8 h-8 border shadow-sm rounded-md bg-muted/50 p-0.5">
                          <AvatarImage
                            src={client.logo}
                            className="object-contain mix-blend-multiply"
                          />
                          <AvatarFallback className="rounded-md bg-transparent">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        {client.website && (
                          <span className="text-xs text-muted-foreground">{client.website}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.cnpj || '-'}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {client.registrationDate
                      ? format(parseISO(client.registrationDate), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.contacts?.length || 0} contatos
                  </TableCell>
                  <TableCell>
                    {client.serverIp ? (
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {client.serverIp}
                      </code>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(client.id)}
                        className="hover:bg-destructive/10 hover:text-destructive"
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
        client={editingClient}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
