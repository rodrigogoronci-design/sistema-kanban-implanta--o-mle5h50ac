CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
      crypt('SL@sp01$', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Gesualdo"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.colaboradores (id, email, nome, role)
    VALUES (new_user_id, 'gesualdo@servicelogic.com.br', 'Gesualdo', 'Administrador')
    ON CONFLICT (id) DO UPDATE SET role = 'Administrador';
  ELSE
    -- Se a conta já existe, redefine a senha para SL@sp01$, confirma o e-mail e garante a role 'Administrador'
    UPDATE auth.users 
    SET encrypted_password = crypt('SL@sp01$', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW())
    WHERE email = 'gesualdo@servicelogic.com.br';
    
    UPDATE public.colaboradores 
    SET role = 'Administrador' 
    WHERE email = 'gesualdo@servicelogic.com.br';
  END IF;
END $$;
