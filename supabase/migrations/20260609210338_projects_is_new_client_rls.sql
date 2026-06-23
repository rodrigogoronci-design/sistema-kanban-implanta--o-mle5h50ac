-- Ensure the column exists with the correct boolean type (idempotent addition)
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS is_new_client BOOLEAN NOT NULL DEFAULT false;

-- Ensure RLS is enabled
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Idempotent policy creation for UPDATE specifically for the projects table functionality
DROP POLICY IF EXISTS "authenticated_update_projects_new_client" ON public.projects;
CREATE POLICY "authenticated_update_projects_new_client" ON public.projects
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
