DO $$
BEGIN
  -- 1. Add training_modality to tasks table
  ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS training_modality TEXT;

  -- 2. Ensure storage buckets exist
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('rat-documents', 'rat-documents', true)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('attachments', 'attachments', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- 3. RLS for storage buckets
DROP POLICY IF EXISTS "public_read_rat_docs" ON storage.objects;
CREATE POLICY "public_read_rat_docs" ON storage.objects 
  FOR SELECT USING (bucket_id = 'rat-documents' OR bucket_id = 'attachments');

DROP POLICY IF EXISTS "auth_insert_rat_docs" ON storage.objects;
CREATE POLICY "auth_insert_rat_docs" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rat-documents' OR bucket_id = 'attachments');

DROP POLICY IF EXISTS "auth_update_rat_docs" ON storage.objects;
CREATE POLICY "auth_update_rat_docs" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'rat-documents' OR bucket_id = 'attachments');

DROP POLICY IF EXISTS "auth_delete_rat_docs" ON storage.objects;
CREATE POLICY "auth_delete_rat_docs" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'rat-documents' OR bucket_id = 'attachments');

-- 4. Auth Seed: gesualdo@servicelogic.com.br
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

-- 5. Tasks and Attachments RLS ensuring proper access
DROP POLICY IF EXISTS "authenticated_select_tasks" ON public.tasks;
CREATE POLICY "authenticated_select_tasks" ON public.tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_tasks" ON public.tasks;
CREATE POLICY "authenticated_insert_tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_tasks" ON public.tasks;
CREATE POLICY "authenticated_update_tasks" ON public.tasks FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_tasks" ON public.tasks;
CREATE POLICY "authenticated_delete_tasks" ON public.tasks FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_attachments" ON public.attachments;
CREATE POLICY "authenticated_select_attachments" ON public.attachments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_attachments" ON public.attachments;
CREATE POLICY "authenticated_insert_attachments" ON public.attachments FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_attachments" ON public.attachments;
CREATE POLICY "authenticated_update_attachments" ON public.attachments FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_delete_attachments" ON public.attachments;
CREATE POLICY "authenticated_delete_attachments" ON public.attachments FOR DELETE TO authenticated USING (true);
