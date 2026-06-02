CREATE TABLE IF NOT EXISTS public.project_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_checklists" ON public.project_checklists;
CREATE POLICY "authenticated_select_checklists" ON public.project_checklists
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_checklists" ON public.project_checklists;
CREATE POLICY "authenticated_insert_checklists" ON public.project_checklists
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_checklists" ON public.project_checklists;
CREATE POLICY "authenticated_update_checklists" ON public.project_checklists
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_checklists" ON public.project_checklists;
CREATE POLICY "authenticated_delete_checklists" ON public.project_checklists
  FOR DELETE TO authenticated USING (true);
