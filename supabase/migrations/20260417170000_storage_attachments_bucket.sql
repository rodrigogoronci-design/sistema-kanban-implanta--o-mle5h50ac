-- Set up attachments storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the bucket
DROP POLICY IF EXISTS "Attachments Public Access" ON storage.objects;
CREATE POLICY "Attachments Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Attachments Authenticated Insert" ON storage.objects;
CREATE POLICY "Attachments Authenticated Insert" ON storage.objects 
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Attachments Authenticated Update" ON storage.objects;
CREATE POLICY "Attachments Authenticated Update" ON storage.objects 
  FOR UPDATE TO authenticated USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "Attachments Authenticated Delete" ON storage.objects;
CREATE POLICY "Attachments Authenticated Delete" ON storage.objects 
  FOR DELETE TO authenticated USING (bucket_id = 'attachments');
