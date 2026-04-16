-- configuracoes
CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor JSONB
);

-- colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  departamento TEXT,
  role TEXT NOT NULL DEFAULT 'Colaborador',
  image_gender TEXT
);

-- clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  logo TEXT,
  registration_date TIMESTAMPTZ,
  website TEXT,
  server_ip TEXT,
  notes TEXT,
  modules JSONB DEFAULT '[]'::jsonb
);

-- client_contacts
CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT
);

-- project_statuses
CREATE TABLE IF NOT EXISTS project_statuses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

-- projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  analyst_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
  status_id TEXT REFERENCES project_statuses(id) ON DELETE SET NULL,
  impl_start TIMESTAMPTZ,
  impl_end TIMESTAMPTZ,
  train_start TIMESTAMPTZ,
  train_end TIMESTAMPTZ,
  op_start TIMESTAMPTZ,
  op_end TIMESTAMPTZ
);

-- columns
CREATE TABLE IF NOT EXISTS columns (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  archived BOOLEAN DEFAULT FALSE,
  position INT DEFAULT 0
);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

-- tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  responsible_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'Média',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  column_id TEXT REFERENCES columns(id) ON DELETE SET NULL,
  description TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- subtasks
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);

-- attachments
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size INT,
  type TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- attachment_tags
CREATE TABLE IF NOT EXISTS attachment_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);

-- task_attachment_tags
CREATE TABLE IF NOT EXISTS task_attachment_tags (
  attachment_id UUID REFERENCES attachments(id) ON DELETE CASCADE,
  tag_id TEXT REFERENCES attachment_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (attachment_id, tag_id)
);

-- time_entries
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  observation TEXT
);

-- Enable RLS
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachment_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachment_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for all tables for authenticated users
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_select" ON public.%I', t);
    EXECUTE format('CREATE POLICY "authenticated_select" ON public.%I FOR SELECT TO authenticated USING (true)', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_insert" ON public.%I', t);
    EXECUTE format('CREATE POLICY "authenticated_insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_update" ON public.%I', t);
    EXECUTE format('CREATE POLICY "authenticated_update" ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "authenticated_delete" ON public.%I FOR DELETE TO authenticated USING (true)', t);
  END LOOP;
END $$;

-- Seed Settings
INSERT INTO configuracoes (chave, valor) VALUES 
('setores', '["Tecnologia", "Administrativo"]'::jsonb),
('role_permissions', '{"Admin": ["/", "/clients", "/projects", "/users", "/reports"]}'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- Seed Admin User
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gesualdo@servicelogic.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'gesualdo@servicelogic.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.colaboradores (id, email, nome, role)
    VALUES (new_user_id, 'gesualdo@servicelogic.com.br', 'Administrador', 'Admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
