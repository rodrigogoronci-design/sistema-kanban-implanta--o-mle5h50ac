CREATE TABLE IF NOT EXISTS public.jornadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jornada_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_id UUID REFERENCES public.jornadas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jornada_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_id UUID REFERENCES public.jornada_etapas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  estimated_hours NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projetos_implantacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jornada_id UUID REFERENCES public.jornadas(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  current_step_id UUID,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projeto_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projetos_implantacao(id) ON DELETE CASCADE,
  etapa_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  responsible_id UUID REFERENCES public.analistas(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'A Fazer',
  forecast_date DATE,
  realization_date DATE,
  hours_spent INT NOT NULL DEFAULT 0,
  minutes_spent INT NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_extra BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.jornadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_implantacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projeto_atividades ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['jornadas','jornada_etapas','jornada_atividades','projetos_implantacao','projeto_atividades'] LOOP
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

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'gesualdo@servicelogic.com.br') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'gesualdo@servicelogic.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Gesualdo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
    INSERT INTO public.colaboradores (id, email, nome, role)
    VALUES (v_user_id, 'gesualdo@servicelogic.com.br', 'Gesualdo', 'Administrador')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

UPDATE auth.users
SET
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, '')
WHERE
  confirmation_token IS NULL OR recovery_token IS NULL
  OR email_change_token_new IS NULL OR email_change IS NULL
  OR email_change_token_current IS NULL
  OR phone_change IS NULL OR phone_change_token IS NULL
  OR reauthentication_token IS NULL;
