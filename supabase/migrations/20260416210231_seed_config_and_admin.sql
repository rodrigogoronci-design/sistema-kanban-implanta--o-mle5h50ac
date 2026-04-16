-- Ensure RLS is enabled and accessible for configs and users
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_config" ON public.configuracoes;
CREATE POLICY "authenticated_select_config" ON public.configuracoes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_colab" ON public.colaboradores;
CREATE POLICY "authenticated_select_colab" ON public.colaboradores FOR SELECT TO authenticated USING (true);

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert default role permissions
  INSERT INTO public.configuracoes (chave, valor)
  VALUES (
    'role_permissions',
    '{"Administrador": ["/", "/clients", "/projects", "/users", "/reports"], "Gerente": ["/", "/clients", "/projects", "/reports"], "Colaborador": ["/", "/projects"]}'::jsonb
  )
  ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

  -- Seed admin user so the current user can access the platform properly
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

    INSERT INTO public.colaboradores (id, nome, email, role)
    VALUES (new_user_id, 'Gesualdo', 'gesualdo@servicelogic.com.br', 'Administrador')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Ensure the user is an admin if they already exist
    UPDATE public.colaboradores
    SET role = 'Administrador'
    WHERE email = 'gesualdo@servicelogic.com.br';
  END IF;
END $$;
