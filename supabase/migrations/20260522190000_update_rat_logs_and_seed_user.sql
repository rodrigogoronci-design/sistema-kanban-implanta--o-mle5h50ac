-- Fix RLS for rat_email_logs
ALTER TABLE public.rat_email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_rat_logs" ON public.rat_email_logs;
CREATE POLICY "authenticated_select_rat_logs" ON public.rat_email_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_rat_logs" ON public.rat_email_logs;
CREATE POLICY "authenticated_insert_rat_logs" ON public.rat_email_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- Seed initial user gesualdo@servicelogic.com.br
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
      '{"name": "Gesualdo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.colaboradores (id, email, nome, role)
    VALUES (new_user_id, 'gesualdo@servicelogic.com.br', 'Gesualdo', 'Administrador')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
