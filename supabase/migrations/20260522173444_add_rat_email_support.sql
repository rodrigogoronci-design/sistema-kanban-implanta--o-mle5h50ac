DO $$
BEGIN
  -- Create 'attachments' bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('attachments', 'attachments', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to read from 'attachments' bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');

-- Allow authenticated users to upload to 'attachments' bucket
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload attachments" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');

-- Allow authenticated users to update their uploads in 'attachments' bucket
DROP POLICY IF EXISTS "Authenticated users can update attachments" ON storage.objects;
CREATE POLICY "Authenticated users can update attachments" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'attachments');

-- Allow authenticated users to delete their uploads in 'attachments' bucket
DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON storage.objects;
CREATE POLICY "Authenticated users can delete attachments" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'attachments');

-- Ensure attachments table has RLS and correct policies
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select" ON public.attachments;
CREATE POLICY "authenticated_select" ON public.attachments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.attachments;
CREATE POLICY "authenticated_insert" ON public.attachments FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.attachments;
CREATE POLICY "authenticated_update" ON public.attachments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.attachments;
CREATE POLICY "authenticated_delete" ON public.attachments FOR DELETE TO authenticated USING (true);
