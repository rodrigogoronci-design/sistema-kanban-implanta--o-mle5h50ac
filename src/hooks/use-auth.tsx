import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Colaborador {
  id: string
  nome: string
  role: string
  departamento: string | null
  image_gender: string | null
  email: string | null
}

interface AuthContextType {
  user: any | null
  session: any | null
  colaborador: Colaborador | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null)
  const [colaborador, setColaborador] = useState<Colaborador | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: adminData } = await supabase
          .from('colaboradores')
          .select('*')
          .eq('role', 'Admin')
          .limit(1)
          .maybeSingle()

        if (adminData) {
          setColaborador(adminData as Colaborador)
          setUser({ id: adminData.user_id || adminData.id, email: adminData.email })
        } else {
          const { data: anyData } = await supabase
            .from('colaboradores')
            .select('*')
            .limit(1)
            .maybeSingle()

          if (anyData) {
            setColaborador(anyData as Colaborador)
            setUser({ id: anyData.user_id || anyData.id, email: anyData.email })
          } else {
            const mock = {
              id: '00000000-0000-0000-0000-000000000000',
              nome: 'Administrador Padrão',
              role: 'Admin',
              departamento: null,
              image_gender: 'male',
              email: 'admin@sistema.local',
            }
            setColaborador(mock)
            setUser({ id: mock.id, email: mock.email })
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        const mock = {
          id: '00000000-0000-0000-0000-000000000000',
          nome: 'Administrador (Offline)',
          role: 'Admin',
          departamento: null,
          image_gender: 'male',
          email: 'admin@sistema.local',
        }
        setColaborador(mock)
        setUser({ id: mock.id, email: mock.email })
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session: null, colaborador, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
