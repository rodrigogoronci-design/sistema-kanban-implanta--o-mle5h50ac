import { useState, useMemo } from 'react'
import useMainStore, { Client } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
import { Plus, Trash2, Pencil, Search, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ClientFormModal } from '@/components/ClientFormModal'

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useMainStore()
  const { toast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredClients = useMemo(() => {
    return clients.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [clients, searchQuery])

  const handleFormSubmit = (data: Omit<Client, 'id'>) => {
    if (editingClient) {
      updateClient(editingClient.id, data)
      toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso!' })
    } else {
      addClient({
        id: Math.random().toString(),
        ...data,
      })
      toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' })
    }
    setFormOpen(false)
  }

  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete)
      toast({ title: 'Sucesso', description: 'Cliente removido.' })
    }
    setClientToDelete(null)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Clientes</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o portfólio de empresas em implantação e seus contatos.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingClient(undefined)
            setFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[80px] text-center">Logo</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Contatos</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow
                key={client.id}
                className="group cursor-pointer"
                onClick={() => {
                  setEditingClient(client)
                  setFormOpen(true)
                }}
              >
                <TableCell className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <Avatar className="w-10 h-10 border bg-muted/50 shadow-sm rounded-md p-0.5">
                    <AvatarImage src={client.logo} className="object-contain mix-blend-multiply" />
                    <AvatarFallback className="rounded-md bg-transparent">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-semibold">{client.name}</TableCell>
                <TableCell className="text-muted-foreground">{client.cnpj || '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {client.contacts?.length
                    ? `${client.contacts.length} contato${client.contacts.length > 1 ? 's' : ''}`
                    : '-'}
                </TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[150px]">
                  {client.website || '-'}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => {
                        setEditingClient(client)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setClientToDelete(client.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ClientFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        client={editingClient}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita e removerá o cliente permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
