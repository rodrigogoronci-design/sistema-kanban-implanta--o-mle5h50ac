import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2, Loader2, Building } from 'lucide-react'

export default function Clients() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    website: '',
    server_ip: '',
  })

  const fetchClients = async () => {
    const { data, error } = await supabase.from('clients').select('*').order('name')
    if (error) {
      toast({
        title: 'Erro ao carregar clientes',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from('clients').insert([formData])
      if (error) throw error

      toast({ title: 'Cliente criado com sucesso' })
      setIsOpen(false)
      fetchClients()
      setFormData({ name: '', cnpj: '', website: '', server_ip: '' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este cliente?')) return

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      toast({ title: 'Cliente excluído' })
      fetchClients()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">Empresas e organizações em implantação.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome / Razão Social</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  value={formData.cnpj}
                  onChange={(e) => setFormData((s) => ({ ...s, cnpj: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData((s) => ({ ...s, website: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IP do Servidor</Label>
                  <Input
                    value={formData.server_ip}
                    onChange={(e) => setFormData((s) => ({ ...s, server_ip: e.target.value }))}
                    placeholder="Ex: 192.168.0.1"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  'Salvar Cliente'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Empresa</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Servidor (IP)</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Carregando clientes...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-md text-primary">
                        <Building className="w-4 h-4" />
                      </div>
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{client.cnpj || '-'}</TableCell>
                  <TableCell className="text-muted-foreground">{client.website || '-'}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {client.server_ip || '-'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(client.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
