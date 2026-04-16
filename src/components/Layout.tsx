import { Link, Outlet, useLocation } from 'react-router-dom'
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
  const navItems = [
    { title: 'Área de Trabalho', url: '/', icon: LayoutDashboard },
    { title: 'Clientes', url: '/clients', icon: Building2 },
    { title: 'Projetos', url: '/projects', icon: Briefcase },
    { title: 'Usuários', url: '/users', icon: Users },
    { title: 'Relatórios', url: '/reports', icon: PieChart },
  ]

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="h-16 flex items-center px-4 border-b font-bold text-xl text-primary justify-start">
          <div className="flex items-center gap-2">
            <div className="bg-accent p-1.5 rounded-md text-white flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="truncate">DeployFlow</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
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
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?seed=admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left truncate">
                  <span className="text-sm font-medium leading-none">Admin User</span>
                  <span className="text-xs text-muted-foreground mt-1">admin@deployflow.com</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" /> Configurações
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
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
