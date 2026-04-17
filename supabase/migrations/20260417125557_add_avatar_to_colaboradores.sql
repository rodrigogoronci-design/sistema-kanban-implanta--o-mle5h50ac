-- Add avatar_url column to colaboradores
ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars storage bucket
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('avatars', 'avatars', true) 
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Setup storage policies for avatars bucket
DO $$
BEGIN
  -- Public Read
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  CREATE POLICY "Public Access" ON storage.objects 
    FOR SELECT USING (bucket_id = 'avatars');
  
  -- Authenticated Upload
  DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
  CREATE POLICY "Authenticated Upload" ON storage.objects 
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');
  
  -- Authenticated Update
  DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
  CREATE POLICY "Authenticated Update" ON storage.objects 
    FOR UPDATE TO authenticated USING (bucket_id = 'avatars');
  
  -- Authenticated Delete
  DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
  CREATE POLICY "Authenticated Delete" ON storage.objects 
    FOR DELETE TO authenticated USING (bucket_id = 'avatars');
END $$;
