import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Settings, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const roles = ['Administrador', 'Gerente', 'Colaborador']
const routes = [
  { title: 'Área de Trabalho', url: '/' },
  { title: 'Clientes', url: '/clients' },
  { title: 'Projetos', url: '/projects' },
  { title: 'Analistas', url: '/analysts' },
  { title: 'Usuários', url: '/users' },
  { title: 'Relatórios', url: '/reports' },
]

const defaultPermissions: Record<string, string[]> = {
  Administrador: ['/', '/clients', '/projects', '/analysts', '/users', '/reports'],
  Gerente: ['/', '/clients', '/projects', '/analysts', '/reports'],
  Colaborador: ['/', '/projects'],
}

export function PermissionsDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [permissions, setPermissions] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchPermissions = async () => {
    const { data } = await supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'role_permissions')
      .single()
    if (data && data.valor) {
      setPermissions(data.valor as Record<string, string[]>)
    } else {
      setPermissions(defaultPermissions)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchPermissions()
    }
  }, [isOpen])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('configuracoes')
        .upsert({ chave: 'role_permissions', valor: permissions })

      if (error) throw error

      toast({ title: 'Permissões salvas com sucesso. Elas terão efeito na próxima navegação.' })
      setIsOpen(false)
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const togglePermission = (role: string, url: string, checked: boolean) => {
    setPermissions((prev) => {
      const rolePerms = prev[role] || []
      if (checked) {
        return { ...prev, [role]: [...rolePerms, url] }
      } else {
        return { ...prev, [role]: rolePerms.filter((p) => p !== url) }
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="shrink-0">
          <Settings className="w-4 h-4 mr-2" /> Permissões
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configurar Permissões de Acesso</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tela / Módulo</TableHead>
                {roles.map((role) => (
                  <TableHead key={role} className="text-center">
                    {role}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.url}>
                  <TableCell className="font-medium">{route.title}</TableCell>
                  {roles.map((role) => (
                    <TableCell key={role} className="text-center">
                      <Checkbox
                        checked={permissions[role]?.includes(route.url) || false}
                        onCheckedChange={(checked) => togglePermission(role, route.url, !!checked)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar Permissões
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
