import { useState, useEffect } from 'react'
import { Client, ClientContact } from '@/stores/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Trash2, Building2 } from 'lucide-react'

export function ClientFormModal({
  open,
  onOpenChange,
  client,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client
  onSubmit: (data: Omit<Client, 'id'>) => void
}) {
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    name: '',
    cnpj: '',
    contacts: [],
    modules: [],
    logo: '',
    website: '',
    serverIp: '',
    notes: '',
  })
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData(
        client
          ? {
              name: client.name,
              cnpj: client.cnpj,
              contacts: client.contacts || [],
              modules: client.modules || [],
              logo: client.logo || '',
              website: client.website || '',
              serverIp: client.serverIp || '',
              notes: client.notes || '',
            }
          : {
              name: '',
              cnpj: '',
              contacts: [],
              modules: ['Módulo Base'],
              logo: '',
              website: '',
              serverIp: '',
              notes: '',
            },
      )
      setEmailErrors({})
    }
  }, [open, client])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false
    const newErrors: Record<string, string> = {}
    formData.contacts.forEach((c) => {
      if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
        newErrors[c.id] = 'E-mail inválido'
        hasError = true
      }
    })
    if (hasError) {
      setEmailErrors(newErrors)
      return
    }
    onSubmit({
      ...formData,
      logo:
        formData.logo ||
        `https://img.usecurling.com/i?q=${formData.name.split(' ')[0] || 'company'}&shape=fill`,
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setFormData((s) => ({ ...s, logo: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const addContact = () => {
    setFormData((s) => ({
      ...s,
      contacts: [...s.contacts, { id: Math.random().toString(), name: '', email: '', phone: '' }],
    }))
  }

  const updateContact = (id: string, field: keyof ClientContact, value: string) => {
    setFormData((s) => ({
      ...s,
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    }))
    if (field === 'email') setEmailErrors((prev) => ({ ...prev, [id]: '' }))
  }

  const removeContact = (id: string) => {
    setFormData((s) => ({ ...s, contacts: s.contacts.filter((c) => c.id !== id) }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? 'Editar Cliente' : 'Cadastrar Cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="logo">Logo do Cliente</Label>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border rounded-xl bg-muted/50 p-1">
                  <AvatarImage src={formData.logo} className="object-contain mix-blend-multiply" />
                  <AvatarFallback className="rounded-xl bg-transparent">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="flex-1"
                />
              </div>
            </div>
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
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData((s) => ({ ...s, website: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serverIp">IP do Servidor</Label>
              <Input
                id="serverIp"
                value={formData.serverIp}
                onChange={(e) => setFormData((s) => ({ ...s, serverIp: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Observações / Anotações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData((s) => ({ ...s, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Contatos</Label>
              <Button type="button" variant="outline" size="sm" onClick={addContact}>
                <Plus className="w-4 h-4 mr-2" /> Adicionar Contato
              </Button>
            </div>
            <div className="space-y-3">
              {formData.contacts.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row gap-3 items-start bg-muted/40 p-3 rounded-lg border"
                >
                  <div className="flex-1 space-y-2 w-full">
                    <Input
                      placeholder="Nome"
                      value={c.name}
                      onChange={(e) => updateContact(c.id, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <Input
                      placeholder="E-mail"
                      type="email"
                      value={c.email}
                      onChange={(e) => updateContact(c.id, 'email', e.target.value)}
                      required
                    />
                    {emailErrors[c.id] && (
                      <p className="text-xs text-destructive">{emailErrors[c.id]}</p>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <Input
                      placeholder="Telefone"
                      value={c.phone}
                      onChange={(e) => updateContact(c.id, 'phone', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0 mt-0.5"
                    onClick={() => removeContact(c.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {formData.contacts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg bg-muted/20">
                  Nenhum contato cadastrado.
                </p>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full">
            {client ? 'Atualizar Cliente' : 'Salvar Cliente'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
