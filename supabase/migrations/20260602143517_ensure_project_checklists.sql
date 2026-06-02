DO $$
BEGIN
  -- Ensure the table exists
  CREATE TABLE IF NOT EXISTS public.project_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
  );
END $$;

-- Enable RLS
ALTER TABLE public.project_checklists ENABLE ROW LEVEL SECURITY;

-- Safely drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "authenticated_select_checklists" ON public.project_checklists;
DROP POLICY IF EXISTS "authenticated_insert_checklists" ON public.project_checklists;
DROP POLICY IF EXISTS "authenticated_update_checklists" ON public.project_checklists;
DROP POLICY IF EXISTS "authenticated_delete_checklists" ON public.project_checklists;

-- Recreate policies for full CRUD as authenticated users
CREATE POLICY "authenticated_select_checklists" ON public.project_checklists
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_insert_checklists" ON public.project_checklists
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "authenticated_update_checklists" ON public.project_checklists
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_delete_checklists" ON public.project_checklists
  FOR DELETE TO authenticated USING (true);

-- Enable Realtime for project_checklists to allow smooth UI sync
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'project_checklists'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_checklists;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- If the realtime publication doesn't exist yet, we safely skip this step
    NULL;
END $$;
