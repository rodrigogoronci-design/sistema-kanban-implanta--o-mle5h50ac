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
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          client_id?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          client_id?: string | null
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
          forecast_end: string | null
          forecast_start: string | null
          id: string
          impl_end: string | null
          impl_start: string | null
          name: string
          op_end: string | null
          op_start: string | null
          status_id: string | null
          train_end: string | null
          train_start: string | null
        }
        Insert: {
          analyst_id?: string | null
          client_id?: string | null
          forecast_end?: string | null
          forecast_start?: string | null
          id?: string
          impl_end?: string | null
          impl_start?: string | null
          name: string
          op_end?: string | null
          op_start?: string | null
          status_id?: string | null
          train_end?: string | null
          train_start?: string | null
        }
        Update: {
          analyst_id?: string | null
          client_id?: string | null
          forecast_end?: string | null
          forecast_start?: string | null
          id?: string
          impl_end?: string | null
          impl_start?: string | null
          name?: string
          op_end?: string | null
          op_start?: string | null
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
          created_at: string | null
          description: string | null
          due_date: string | null
          end_date: string | null
          id: string
          priority: string
          project_id: string | null
          responsible_id: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          start_date: string | null
          title: string
        }
        Insert: {
          category_id?: string | null
          client_id?: string | null
          column_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          responsible_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          start_date?: string | null
          title: string
        }
        Update: {
          category_id?: string | null
          client_id?: string | null
          column_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          responsible_id?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          start_date?: string | null
          title?: string
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


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: analistas
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   especialidade: text (nullable)
//   user_id: uuid (nullable)
//   status: text (not null, default: 'Ativo'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: attachment_tags
//   id: text (not null)
//   name: text (not null)
//   color: text (not null)
// Table: attachments
//   id: uuid (not null, default: gen_random_uuid())
//   task_id: uuid (nullable)
//   name: text (not null)
//   size: integer (nullable)
//   type: text (nullable)
//   url: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: categories
//   id: text (not null)
//   name: text (not null)
//   color: text (not null)
// Table: client_contacts
//   id: uuid (not null, default: gen_random_uuid())
//   client_id: uuid (nullable)
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
// Table: client_statuses
//   id: text (not null)
//   name: text (not null)
//   color: text (not null)
// Table: clients
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   cnpj: text (nullable)
//   logo: text (nullable)
//   registration_date: timestamp with time zone (nullable)
//   website: text (nullable)
//   server_ip: text (nullable)
//   notes: text (nullable)
//   modules: jsonb (nullable, default: '[]'::jsonb)
//   status_id: text (nullable)
// Table: colaboradores
//   id: uuid (not null)
//   nome: text (not null)
//   email: text (not null)
//   telefone: text (nullable)
//   departamento: text (nullable)
//   role: text (not null, default: 'Colaborador'::text)
//   image_gender: text (nullable)
//   avatar_url: text (nullable)
//   setor_id: uuid (nullable)
// Table: columns
//   id: text (not null)
//   title: text (not null)
//   archived: boolean (nullable, default: false)
//   position: integer (nullable, default: 0)
// Table: configuracoes
//   chave: text (not null)
//   valor: jsonb (nullable)
// Table: project_statuses
//   id: text (not null)
//   name: text (not null)
//   color: text (not null)
// Table: projects
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   client_id: uuid (nullable)
//   analyst_id: uuid (nullable)
//   status_id: text (nullable)
//   impl_start: timestamp with time zone (nullable)
//   impl_end: timestamp with time zone (nullable)
//   train_start: timestamp with time zone (nullable)
//   train_end: timestamp with time zone (nullable)
//   op_start: timestamp with time zone (nullable)
//   op_end: timestamp with time zone (nullable)
//   forecast_start: timestamp with time zone (nullable)
//   forecast_end: timestamp with time zone (nullable)
// Table: setores
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: subtasks
//   id: uuid (not null, default: gen_random_uuid())
//   task_id: uuid (nullable)
//   title: text (not null)
//   completed: boolean (nullable, default: false)
// Table: task_attachment_tags
//   attachment_id: uuid (not null)
//   tag_id: text (not null)
// Table: tasks
//   id: uuid (not null, default: gen_random_uuid())
//   title: text (not null)
//   client_id: uuid (nullable)
//   project_id: uuid (nullable)
//   responsible_id: uuid (nullable)
//   priority: text (not null, default: 'Média'::text)
//   category_id: text (nullable)
//   column_id: text (nullable)
//   description: text (nullable)
//   start_date: timestamp with time zone (nullable)
//   end_date: timestamp with time zone (nullable)
//   due_date: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   scheduled_date: date (nullable)
//   scheduled_time: time without time zone (nullable)
// Table: time_entries
//   id: uuid (not null, default: gen_random_uuid())
//   task_id: uuid (nullable)
//   start_time: timestamp with time zone (not null)
//   end_time: timestamp with time zone (nullable)
//   observation: text (nullable)

// --- CONSTRAINTS ---
// Table: analistas
//   PRIMARY KEY analistas_pkey: PRIMARY KEY (id)
//   FOREIGN KEY analistas_user_id_fkey: FOREIGN KEY (user_id) REFERENCES colaboradores(id) ON DELETE SET NULL
// Table: attachment_tags
//   PRIMARY KEY attachment_tags_pkey: PRIMARY KEY (id)
// Table: attachments
//   PRIMARY KEY attachments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY attachments_task_id_fkey: FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
// Table: categories
//   PRIMARY KEY categories_pkey: PRIMARY KEY (id)
// Table: client_contacts
//   FOREIGN KEY client_contacts_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY client_contacts_pkey: PRIMARY KEY (id)
// Table: client_statuses
//   PRIMARY KEY client_statuses_pkey: PRIMARY KEY (id)
// Table: clients
//   PRIMARY KEY clients_pkey: PRIMARY KEY (id)
//   FOREIGN KEY clients_status_id_fkey: FOREIGN KEY (status_id) REFERENCES client_statuses(id) ON DELETE SET NULL
// Table: colaboradores
//   FOREIGN KEY colaboradores_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY colaboradores_pkey: PRIMARY KEY (id)
//   FOREIGN KEY colaboradores_setor_id_fkey: FOREIGN KEY (setor_id) REFERENCES setores(id) ON DELETE SET NULL
// Table: columns
//   PRIMARY KEY columns_pkey: PRIMARY KEY (id)
// Table: configuracoes
//   PRIMARY KEY configuracoes_pkey: PRIMARY KEY (chave)
// Table: project_statuses
//   PRIMARY KEY project_statuses_pkey: PRIMARY KEY (id)
// Table: projects
//   FOREIGN KEY projects_analyst_id_fkey: FOREIGN KEY (analyst_id) REFERENCES analistas(id) ON DELETE SET NULL
//   FOREIGN KEY projects_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   PRIMARY KEY projects_pkey: PRIMARY KEY (id)
//   FOREIGN KEY projects_status_id_fkey: FOREIGN KEY (status_id) REFERENCES project_statuses(id) ON DELETE SET NULL
// Table: setores
//   UNIQUE setores_nome_key: UNIQUE (nome)
//   PRIMARY KEY setores_pkey: PRIMARY KEY (id)
// Table: subtasks
//   PRIMARY KEY subtasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY subtasks_task_id_fkey: FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
// Table: task_attachment_tags
//   FOREIGN KEY task_attachment_tags_attachment_id_fkey: FOREIGN KEY (attachment_id) REFERENCES attachments(id) ON DELETE CASCADE
//   PRIMARY KEY task_attachment_tags_pkey: PRIMARY KEY (attachment_id, tag_id)
//   FOREIGN KEY task_attachment_tags_tag_id_fkey: FOREIGN KEY (tag_id) REFERENCES attachment_tags(id) ON DELETE CASCADE
// Table: tasks
//   FOREIGN KEY tasks_category_id_fkey: FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
//   FOREIGN KEY tasks_client_id_fkey: FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
//   FOREIGN KEY tasks_column_id_fkey: FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE SET NULL
//   PRIMARY KEY tasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY tasks_project_id_fkey: FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
//   FOREIGN KEY tasks_responsible_id_fkey: FOREIGN KEY (responsible_id) REFERENCES analistas(id) ON DELETE SET NULL
// Table: time_entries
//   PRIMARY KEY time_entries_pkey: PRIMARY KEY (id)
//   FOREIGN KEY time_entries_task_id_fkey: FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE

// --- ROW LEVEL SECURITY POLICIES ---
// Table: analistas
//   Policy "authenticated_delete_analistas" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_analistas" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_analistas" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_analistas" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: attachment_tags
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: attachments
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: categories
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: client_contacts
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: client_statuses
//   Policy "authenticated_delete_client_statuses" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_client_statuses" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_client_statuses" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_client_statuses" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: clients
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: colaboradores
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_select_colab" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: columns
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: configuracoes
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_select_config" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: project_statuses
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: projects
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: setores
//   Policy "authenticated_delete_setores" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert_setores" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select_setores" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update_setores" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: subtasks
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: task_attachment_tags
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: tasks
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: time_entries
//   Policy "authenticated_delete" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "authenticated_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- INDEXES ---
// Table: setores
//   CREATE UNIQUE INDEX setores_nome_key ON public.setores USING btree (nome)

