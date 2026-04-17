import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  LogOut,
  Settings,
  PieChart,
  UserCheck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, colaborador, signOut } = useAuth()
  const [permissions, setPermissions] = useState<Record<string, string[]>>({})

  const navItems = [
    { title: 'Área de Trabalho', url: '/', icon: LayoutDashboard },
    { title: 'Clientes', url: '/clients', icon: Building2 },
    { title: 'Projetos', url: '/projects', icon: Briefcase },
    { title: 'Analistas', url: '/analysts', icon: UserCheck },
    { title: 'Usuários', url: '/users', icon: Users },
    { title: 'Relatórios', url: '/reports', icon: PieChart },
  ]

  useEffect(() => {
    supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', 'role_permissions')
      .single()
      .then(({ data }) => {
        if (data && data.valor) {
          setPermissions(data.valor as Record<string, string[]>)
        }
      })
  }, [])

  const defaultPermissions: Record<string, string[]> = {
    Administrador: ['/', '/clients', '/projects', '/analysts', '/users', '/reports'],
    Gerente: ['/', '/clients', '/projects', '/analysts', '/reports'],
    Colaborador: ['/', '/projects'],
  }

  const userRole = colaborador?.role || 'Administrador'
  const activePermissions = Object.keys(permissions).length > 0 ? permissions : defaultPermissions
  const allowedRoutes = activePermissions[userRole] || activePermissions['Administrador'] || ['/']
  const allowedRoutesStr = JSON.stringify(allowedRoutes)

  useEffect(() => {
    const routes = JSON.parse(allowedRoutesStr)
    const isAllowed =
      location.pathname === '/'
        ? routes.includes('/')
        : routes.some((route: string) => route !== '/' && location.pathname.startsWith(route))

    if (!isAllowed && location.pathname !== '/') {
      navigate('/')
    }
  }, [location.pathname, allowedRoutesStr, navigate])

  const filteredNavItems = navItems.filter((item) => allowedRoutes.includes(item.url))

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 flex items-center px-4 border-b font-bold text-xl text-primary justify-start">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-1.5 rounded-md text-white flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="truncate">Implantação</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredNavItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 py-6">
                <Avatar className="h-8 w-8 mr-2 border border-border">
                  <AvatarImage
                    src={`https://img.usecurling.com/ppl/thumbnail?seed=${colaborador?.nome || 'user'}`}
                  />
                  <AvatarFallback>
                    {colaborador?.nome?.substring(0, 2).toUpperCase() || 'US'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left truncate">
                  <span className="text-sm font-medium leading-none">
                    {colaborador?.nome || 'Usuário'}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {colaborador?.email || user?.email}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem disabled>
                <span className="text-xs text-muted-foreground font-medium">
                  Perfil: {userRole}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 md:px-6 transition-[width,height] ease-linear shadow-sm z-10">
          <SidebarTrigger className="-ml-2 text-muted-foreground" />
          <div className="flex-1 flex items-center">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              {navItems.find((n) => n.url === location.pathname)?.title || 'Detalhes'}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6 lg:p-8 animate-fade-in relative">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
