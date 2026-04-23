CREATE TABLE IF NOT EXISTS public.project_analysts (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  analyst_id UUID REFERENCES public.analistas(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, analyst_id)
);

ALTER TABLE public.project_analysts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_project_analysts" ON public.project_analysts;
CREATE POLICY "authenticated_select_project_analysts" ON public.project_analysts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_project_analysts" ON public.project_analysts;
CREATE POLICY "authenticated_insert_project_analysts" ON public.project_analysts
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_project_analysts" ON public.project_analysts;
CREATE POLICY "authenticated_update_project_analysts" ON public.project_analysts
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_project_analysts" ON public.project_analysts;
CREATE POLICY "authenticated_delete_project_analysts" ON public.project_analysts
  FOR DELETE TO authenticated USING (true);

INSERT INTO public.project_analysts (project_id, analyst_id)
SELECT id, analyst_id FROM public.projects WHERE analyst_id IS NOT NULL
ON CONFLICT DO NOTHING;
