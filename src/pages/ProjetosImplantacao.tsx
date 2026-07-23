import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building2, Calendar, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProjetoFormModal } from '@/components/projetos-implantacao/ProjetoFormModal'
import { fetchProjetos, ProjetoImplantacao } from '@/services/projetos-implantacao'
import { toast } from '@/hooks/use-toast'

export default function ProjetosImplantacao() {
  const [projetos, setProjetos] = useState<ProjetoImplantacao[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewClientOnly, setShowNewClientOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const loadProjetos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchProjetos(showNewClientOnly ? { isNewClient: true } : undefined)
      setProjetos(data)
    } catch {
      toast({ title: 'Erro', description: 'Falha ao carregar projetos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [showNewClientOnly])

  useEffect(() => {
    loadProjetos()
  }, [loadProjetos])

  const filteredProjetos = projetos.filter(
    (p) => !search || p.name?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Projetos de Implantação</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={showNewClientOnly}
            onCheckedChange={setShowNewClientOnly}
            id="filter-new-client"
          />
          <Label htmlFor="filter-new-client" className="cursor-pointer whitespace-nowrap">
            Novo Cliente
          </Label>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando projetos...</div>
      ) : filteredProjetos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum projeto encontrado.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjetos.map((projeto) => (
            <Link key={projeto.id} to={`/projetos-implantacao/${projeto.id}`}>
              <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base leading-tight">{projeto.name}</CardTitle>
                    {projeto.is_new_client && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Novo Cliente
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm text-muted-foreground">
                  {projeto.client && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{projeto.client.name}</span>
                    </div>
                  )}
                  {projeto.analyst && (
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{projeto.analyst.nome}</span>
                    </div>
                  )}
                  {projeto.data_demanda && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(projeto.data_demanda).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant={projeto.status === 'Ativo' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {projeto.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ProjetoFormModal open={modalOpen} onOpenChange={setModalOpen} onSaved={loadProjetos} />
    </div>
  )
}
