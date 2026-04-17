DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Seeding the requested user specifically with the provided password for recovery
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
      crypt('SL@sp01$', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Gesualdo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'gesualdo@servicelogic.com.br';
    
    -- Ensure the user password matches the one requested and is confirmed
    UPDATE auth.users 
    SET encrypted_password = crypt('SL@sp01$', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE id = v_user_id;
  END IF;

  -- Ensure the profile has Full Access (Administrador)
  INSERT INTO public.colaboradores (id, email, nome, role)
  VALUES (v_user_id, 'gesualdo@servicelogic.com.br', 'Gesualdo', 'Administrador')
  ON CONFLICT (id) DO UPDATE SET role = 'Administrador';

  -- Seed initial permissions mapping if missing
  INSERT INTO public.configuracoes (chave, valor)
  VALUES (
    'role_permissions',
    '{"Administrador": ["/", "/clients", "/projects", "/analysts", "/users", "/reports"], "Gerente": ["/", "/clients", "/projects", "/analysts", "/reports"], "Colaborador": ["/", "/projects"]}'::jsonb
  )
  ON CONFLICT (chave) DO NOTHING;
END $$;

-- Fix any possible nulls in token strings (Supabase GoTrue bug)
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
