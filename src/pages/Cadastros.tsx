import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Package, ArrowRight } from 'lucide-react'

export default function Cadastros() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Cadastros</h2>
        <p className="text-muted-foreground mt-1">
          Central de cadastros e parametrizações do sistema.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/cadastros/modules" className="block h-full">
          <Card className="hover:border-primary transition-colors cursor-pointer h-full group">
            <CardHeader>
              <Package className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <CardTitle className="flex items-center justify-between">
                Gerenciar Módulos
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </CardTitle>
              <CardDescription>
                Listar, criar e atualizar módulos de treinamento para clientes.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
