import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Briefcase, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const { error } = await signIn(email, password)
    if (error) {
      toast({ title: 'Erro ao fazer login', description: error.message, variant: 'destructive' })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 bg-card p-8 rounded-xl border shadow-lg animate-fade-in-up">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="bg-primary p-3 rounded-xl text-primary-foreground mb-2 shadow-sm">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DeployFlow</h1>
          <p className="text-sm text-muted-foreground text-center">
            Insira suas credenciais para acessar o sistema
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Entrar no Sistema'}
          </Button>
        </form>
      </div>
    </div>
  )
}
