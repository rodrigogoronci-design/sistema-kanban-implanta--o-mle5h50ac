-- Idempotent RLS policies for project_checklists to allow authenticated users to perform CRUD operations

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
