import { useState } from 'react'
import useMainStore from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

export default function Clients() {
  const { clients, addClient, deleteClient } = useMainStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', cnpj: '', contact: '', integrations: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    addClient({
      id: Math.random().toString(),
      name: formData.name,
      cnpj: formData.cnpj,
      contact: formData.contact,
      integrations: formData.integrations,
      modules: ['Módulo Base'],
      logo: `https://img.usecurling.com/i?q=${formData.name.split(' ')[0]}&shape=fill`,
    })
    setFormData({ name: '', cnpj: '', contact: '', integrations: '' })
    setOpen(false)
    toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">Clientes</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie o portfólio de empresas em implantação.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => setFormData((s) => ({ ...s, cnpj: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contato Principal</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData((s) => ({ ...s, contact: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="integ">Sistemas Atuais (Integrações)</Label>
                <Input
                  id="integ"
                  placeholder="Ex: SAP, Totvs, Salesforce..."
                  value={formData.integrations}
                  onChange={(e) => setFormData((s) => ({ ...s, integrations: e.target.value }))}
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Cliente
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card
            key={client.id}
            className="card-hover-lift group relative overflow-hidden border shadow-sm"
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-destructive bg-background/80 hover:bg-destructive/10 transition-opacity"
              onClick={() => deleteClient(client.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <div className="w-14 h-14 rounded-xl border bg-muted/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1">
                <img
                  src={client.logo}
                  alt={client.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.parentElement!.innerHTML =
                      '<Building2 class="w-6 h-6 text-muted-foreground"/>'
                  }}
                />
              </div>
              <div>
                <CardTitle className="text-lg leading-tight">{client.name}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  {client.cnpj || 'CNPJ não informado'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-5 text-sm text-muted-foreground space-y-3">
              <div className="flex flex-col gap-1.5 bg-muted/30 p-3 rounded-lg border border-border/50">
                <p>
                  <span className="font-semibold text-foreground">Contato:</span>{' '}
                  {client.contact || '-'}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Integrações:</span>{' '}
                  {client.integrations || '-'}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {client.modules.map((m) => (
                  <Badge
                    key={m}
                    variant="secondary"
                    className="text-[11px] font-medium px-2 shadow-sm"
                  >
                    {m}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {clients.length === 0 && (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/20">
          Nenhum cliente cadastrado.
        </div>
      )}
    </div>
  )
}
