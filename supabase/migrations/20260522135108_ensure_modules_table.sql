-- Ensure the modules table exists
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure the unique constraint on name exists
CREATE UNIQUE INDEX IF NOT EXISTS modules_name_key ON public.modules USING btree (name);

-- Ensure RLS is enabled
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

-- Ensure RLS policies for authenticated users
DROP POLICY IF EXISTS "authenticated_select_modules" ON public.modules;
CREATE POLICY "authenticated_select_modules" ON public.modules
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_modules" ON public.modules;
CREATE POLICY "authenticated_insert_modules" ON public.modules
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_modules" ON public.modules;
CREATE POLICY "authenticated_update_modules" ON public.modules
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_modules" ON public.modules;
CREATE POLICY "authenticated_delete_modules" ON public.modules
  FOR DELETE TO authenticated USING (true);
