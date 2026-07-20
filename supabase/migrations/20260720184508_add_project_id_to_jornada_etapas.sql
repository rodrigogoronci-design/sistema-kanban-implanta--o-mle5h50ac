ALTER TABLE public.jornada_etapas ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projetos_implantacao(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_jornada_etapas_project_id ON public.jornada_etapas(project_id);

DROP POLICY IF EXISTS "authenticated_select" ON public.jornada_etapas;
CREATE POLICY "authenticated_select" ON public.jornada_etapas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.jornada_etapas;
CREATE POLICY "authenticated_insert" ON public.jornada_etapas
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.jornada_etapas;
CREATE POLICY "authenticated_update" ON public.jornada_etapas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.jornada_etapas;
CREATE POLICY "authenticated_delete" ON public.jornada_etapas
  FOR DELETE TO authenticated USING (true);
