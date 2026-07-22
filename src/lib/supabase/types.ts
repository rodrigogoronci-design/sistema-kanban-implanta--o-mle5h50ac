// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analistas: {
        Row: {
          created_at: string
          especialidade: string | null
          id: string
          nome: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          especialidade?: string | null
          id?: string
          nome: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          especialidade?: string | null
          id?: string
          nome?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analistas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      attachment_tags: {
        Row: {
          color: string
          id: string
          name: string
        }
        Insert: {
          color: string
          id: string
          name: string
        }
        Update: {
          color?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string | null
          id: string
          name: string
          size: number | null
          task_id: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          size?: number | null
          task_id?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          size?: number | null
          task_id?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          id: string
          name: string
        }
        Insert: {
          color: string
          id: string
          name: string
        }
        Update: {
          color?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      client_contacts: {
        Row: {
          client_id: string | null
          department: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          client_id?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          client_id?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_statuses: {
        Row: {
          color: string
          id: string
          name: string
        }
        Insert: {
          color: string
          id: string
          name: string
        }
        Update: {
          color?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          cnpj: string | null
          id: string
          logo: string | null
          modules: Json | null
          name: string
          notes: string | null
          registration_date: string | null
          server_ip: string | null
          status_id: string | null
          website: string | null
        }
        Insert: {
          cnpj?: string | null
          id?: string
          logo?: string | null
          modules?: Json | null
          name: string
          notes?: string | null
          registration_date?: string | null
          server_ip?: string | null
          status_id?: string | null
          website?: string | null
        }
        Update: {
          cnpj?: string | null
          id?: string
          logo?: string | null
          modules?: Json | null
          name?: string
          notes?: string | null
          registration_date?: string | null
          server_ip?: string | null
          status_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "client_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          avatar_url: string | null
          departamento: string | null
          email: string
          id: string
          image_gender: string | null
          nome: string
          role: string
          setor_id: string | null
          telefone: string | null
        }
        Insert: {
          avatar_url?: string | null
          departamento?: string | null
          email: string
          id: string
          image_gender?: string | null
          nome: string
          role?: string
          setor_id?: string | null
          telefone?: string | null
        }
        Update: {
          avatar_url?: string | null
          departamento?: string | null
          email?: string
          id?: string
          image_gender?: string | null
          nome?: string
          role?: string
          setor_id?: string | null
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      columns: {
        Row: {
          archived: boolean | null
          id: string
          position: number | null
          title: string
        }
        Insert: {
          archived?: boolean | null
          id: string
          position?: number | null
          title: string
        }
        Update: {
          archived?: boolean | null
          id?: string
          position?: number | null
          title?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          valor: Json | null
        }
        Insert: {
          chave: string
          valor?: Json | null
        }
        Update: {
          chave?: string
          valor?: Json | null
        }
        Relationships: []
      }
      jornada_atividades: {
        Row: {
          created_at: string
          description: string | null
          estimated_hours: number | null
          etapa_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          etapa_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          etapa_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "jornada_atividades_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "jornada_etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      jornada_etapas: {
        Row: {
          created_at: string
          id: string
          jornada_id: string | null
          name: string
          position: number
          project_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          jornada_id?: string | null
          name: string
          position?: number
          project_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          jornada_id?: string | null
          name?: string
          position?: number
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jornada_etapas_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "jornadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jornada_etapas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projetos_implantacao"
            referencedColumns: ["id"]
          },
        ]
      }
      jornadas: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "jornadas_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      project_analysts: {
        Row: {
          analyst_id: string
          project_id: string
        }
        Insert: {
          analyst_id: string
          project_id: string
        }
        Update: {
          analyst_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_analysts_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "analistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_analysts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_checklists: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          project_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          project_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_checklists_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_statuses: {
        Row: {
          color: string
          id: string
          name: string
        }
        Insert: {
          color: string
          id: string
          name: string
        }
        Update: {
          color?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          analyst_id: string | null
          client_id: string | null
          commission_status: string | null
          contracted_hours: number | null
          forecast_end: string | null
          forecast_start: string | null
          generates_commission: boolean | null
          id: string
          impl_end: string | null
          impl_start: string | null
          is_new_client: boolean
          name: string
          notes: string | null
          op_end: string | null
          op_start: string | null
          priority: string | null
          status_id: string | null
          train_end: string | null
          train_start: string | null
        }
        Insert: {
          analyst_id?: string | null
          client_id?: string | null
          commission_status?: string | null
          contracted_hours?: number | null
          forecast_end?: string | null
          forecast_start?: string | null
          generates_commission?: boolean | null
          id?: string
          impl_end?: string | null
          impl_start?: string | null
          is_new_client?: boolean
          name: string
          notes?: string | null
          op_end?: string | null
          op_start?: string | null
          priority?: string | null
          status_id?: string | null
          train_end?: string | null
          train_start?: string | null
        }
        Update: {
          analyst_id?: string | null
          client_id?: string | null
          commission_status?: string | null
          contracted_hours?: number | null
          forecast_end?: string | null
          forecast_start?: string | null
          generates_commission?: boolean | null
          id?: string
          impl_end?: string | null
          impl_start?: string | null
          is_new_client?: boolean
          name?: string
          notes?: string | null
          op_end?: string | null
          op_start?: string | null
          priority?: string | null
          status_id?: string | null
          train_end?: string | null
          train_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "analistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "project_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_atividade_time_entries: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          id: string
          projeto_atividade_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          projeto_atividade_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          projeto_atividade_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_atividade_time_entries_projeto_atividade_id_fkey"
            columns: ["projeto_atividade_id"]
            isOneToOne: false
            referencedRelation: "projeto_atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      projeto_atividades: {
        Row: {
          description: string | null
          etapa_id: string
          forecast_date: string | null
          hours_spent: number
          id: string
          is_completed: boolean
          is_extra: boolean
          minutes_spent: number
          name: string
          project_id: string | null
          rat_url: string | null
          realization_date: string | null
          responsible_id: string | null
          status: string
        }
        Insert: {
          description?: string | null
          etapa_id: string
          forecast_date?: string | null
          hours_spent?: number
          id?: string
          is_completed?: boolean
          is_extra?: boolean
          minutes_spent?: number
          name: string
          project_id?: string | null
          rat_url?: string | null
          realization_date?: string | null
          responsible_id?: string | null
          status?: string
        }
        Update: {
          description?: string | null
          etapa_id?: string
          forecast_date?: string | null
          hours_spent?: number
          id?: string
          is_completed?: boolean
          is_extra?: boolean
          minutes_spent?: number
          name?: string
          project_id?: string | null
          rat_url?: string | null
          realization_date?: string | null
          responsible_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projeto_atividades_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projetos_implantacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projeto_atividades_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "analistas"
            referencedColumns: ["id"]
          },
        ]
      }
      projetos_implantacao: {
        Row: {
          analyst_id: string | null
          client_id: string | null
          created_at: string
          current_step_id: string | null
          data_demanda: string | null
          id: string
          jornada_id: string | null
          name: string
          status: string
        }
        Insert: {
          analyst_id?: string | null
          client_id?: string | null
          created_at?: string
          current_step_id?: string | null
          data_demanda?: string | null
          id?: string
          jornada_id?: string | null
          name: string
          status?: string
        }
        Update: {
          analyst_id?: string | null
          client_id?: string | null
          created_at?: string
          current_step_id?: string | null
          data_demanda?: string | null
          id?: string
          jornada_id?: string | null
          name?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projetos_implantacao_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "analistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_implantacao_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projetos_implantacao_jornada_id_fkey"
            columns: ["jornada_id"]
            isOneToOne: false
            referencedRelation: "jornadas"
            referencedColumns: ["id"]
          },
        ]
      }
      rat_email_logs: {
        Row: {
          error_message: string | null
          id: string
          pdf_url: string | null
          recipient_email: string
          sent_at: string
          status: string
          task_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          pdf_url?: string | null
          recipient_email: string
          sent_at?: string
          status: string
          task_id?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          pdf_url?: string | null
          recipient_email?: string
          sent_at?: string
          status?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rat_email_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean | null
          id: string
          task_id: string | null
          title: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          task_id?: string | null
          title: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_analysts: {
        Row: {
          analyst_id: string
          task_id: string
        }
        Insert: {
          analyst_id: string
          task_id: string
        }
        Update: {
          analyst_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_analysts_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "analistas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_analysts_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachment_tags: {
        Row: {
          attachment_id: string
          tag_id: string
        }
        Insert: {
          attachment_id: string
          tag_id: string
        }
        Update: {
          attachment_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachment_tags_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "attachments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachment_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "attachment_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          category_id: string | null
          client_id: string | null
          column_id: string | null
          completion_date: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          end_date: string | null
          id: string
          participants: Json | null
          priority: string
          project_id: string | null
          recording_url: string | null
          responsible_id: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          start_date: string | null
          title: string
          trained_modules: Json | null
          training_modality: string | null
        }
        Insert: {
          category_id?: string | null
          client_id?: string | null
          column_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          participants?: Json | null
          priority?: string
          project_id?: string | null
          recording_url?: string | null
          responsible_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          start_date?: string | null
          title: string
          trained_modules?: Json | null
          training_modality?: string | null
        }
        Update: {
          category_id?: string | null
          client_id?: string | null
          column_id?: string | null
          completion_date?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          participants?: Json | null
          priority?: string
          project_id?: string | null
          recording_url?: string | null
          responsible_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          start_date?: string | null
          title?: string
          trained_modules?: Json | null
          training_modality?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_column_id_fkey"
            columns: ["column_id"]
            isOneToOne: false
            referencedRelation: "columns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_responsible_id_fkey"
            columns: ["responsible_id"]
            isOneToOne: false
            referencedRelation: "analistas"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          end_time: string | null
          id: string
          observation: string | null
          start_time: string
          task_id: string | null
        }
        Insert: {
          end_time?: string | null
          id?: string
          observation?: string | null
          start_time: string
          task_id?: string | null
        }
        Update: {
          end_time?: string | null
          id?: string
          observation?: string | null
          start_time?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

