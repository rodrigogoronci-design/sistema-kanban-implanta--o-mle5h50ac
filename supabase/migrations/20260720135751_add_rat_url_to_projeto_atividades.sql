-- Add rat_url column to projeto_atividades (idempotent)
ALTER TABLE public.projeto_atividades ADD COLUMN IF NOT EXISTS rat_url TEXT;

-- Create rat-uploads storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('rat-uploads', 'rat-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for rat-uploads bucket (idempotent)
DROP POLICY IF EXISTS "rat_uploads_select" ON storage.objects;
CREATE POLICY "rat_uploads_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'rat-uploads');

DROP POLICY IF EXISTS "rat_uploads_insert" ON storage.objects;
CREATE POLICY "rat_uploads_insert" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'rat-uploads');

DROP POLICY IF EXISTS "rat_uploads_update" ON storage.objects;
CREATE POLICY "rat_uploads_update" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'rat-uploads') WITH CHECK (bucket_id = 'rat-uploads');

DROP POLICY IF EXISTS "rat_uploads_delete" ON storage.objects;
CREATE POLICY "rat_uploads_delete" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'rat-uploads');

-- Ensure RLS policies on projeto_atividades (idempotent)
DROP POLICY IF EXISTS "authenticated_select" ON public.projeto_atividades;
CREATE POLICY "authenticated_select" ON public.projeto_atividades
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.projeto_atividades;
CREATE POLICY "authenticated_insert" ON public.projeto_atividades
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.projeto_atividades;
CREATE POLICY "authenticated_update" ON public.projeto_atividades
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.projeto_atividades;
CREATE POLICY "authenticated_delete" ON public.projeto_atividades
  FOR DELETE TO authenticated USING (true);

-- Ensure RLS policies on projetos_implantacao (idempotent)
DROP POLICY IF EXISTS "authenticated_select" ON public.projetos_implantacao;
CREATE POLICY "authenticated_select" ON public.projetos_implantacao
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.projetos_implantacao;
CREATE POLICY "authenticated_insert" ON public.projetos_implantacao
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.projetos_implantacao;
CREATE POLICY "authenticated_update" ON public.projetos_implantacao
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.projetos_implantacao;
CREATE POLICY "authenticated_delete" ON public.projetos_implantacao
  FOR DELETE TO authenticated USING (true);
