-- Ensure projects table has RLS enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Ensure authenticated users can update projects (Idempotent policy creation)
DROP POLICY IF EXISTS "authenticated_update" ON public.projects;
CREATE POLICY "authenticated_update" ON public.projects
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
