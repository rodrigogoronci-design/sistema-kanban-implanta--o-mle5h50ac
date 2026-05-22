DO $$
BEGIN
  -- Create the storage bucket if not exists
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('attachments', 'attachments', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Storage object policies for 'attachments' bucket
DROP POLICY IF EXISTS "authenticated_select_attachments" ON storage.objects;
CREATE POLICY "authenticated_select_attachments" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "authenticated_insert_attachments" ON storage.objects;
CREATE POLICY "authenticated_insert_attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "authenticated_update_attachments" ON storage.objects;
CREATE POLICY "authenticated_update_attachments" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "authenticated_delete_attachments" ON storage.objects;
CREATE POLICY "authenticated_delete_attachments" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'attachments');

-- Allow public access to read the files since the bucket is public
DROP POLICY IF EXISTS "public_select_attachments" ON storage.objects;
CREATE POLICY "public_select_attachments" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'attachments');

-- Re-apply policies on the public.attachments table to ensure correctness
DROP POLICY IF EXISTS "authenticated_select" ON public.attachments;
CREATE POLICY "authenticated_select" ON public.attachments
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.attachments;
CREATE POLICY "authenticated_insert" ON public.attachments
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.attachments;
CREATE POLICY "authenticated_update" ON public.attachments
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.attachments;
CREATE POLICY "authenticated_delete" ON public.attachments
  FOR DELETE TO authenticated USING (true);
