DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
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
      '',    -- confirmation_token
      '',    -- recovery_token
      '',    -- email_change_token_new
      '',    -- email_change
      '',    -- email_change_token_current
      NULL,  -- phone
      '',    -- phone_change
      '',    -- phone_change_token
      ''     -- reauthentication_token
    );

    INSERT INTO public.colaboradores (id, email, nome, role)
    VALUES (new_user_id, 'gesualdo@servicelogic.com.br', 'Gesualdo', 'Admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Create attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for storage.objects
DROP POLICY IF EXISTS "authenticated_insert_attachments" ON storage.objects;
CREATE POLICY "authenticated_insert_attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "authenticated_select_attachments" ON storage.objects;
CREATE POLICY "authenticated_select_attachments" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "public_select_attachments" ON storage.objects;
CREATE POLICY "public_select_attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');

-- RLS Policies for public.attachments table
DROP POLICY IF EXISTS "authenticated_insert" ON public.attachments;
CREATE POLICY "authenticated_insert" ON public.attachments
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_select" ON public.attachments;
CREATE POLICY "authenticated_select" ON public.attachments
  FOR SELECT TO authenticated USING (true);
