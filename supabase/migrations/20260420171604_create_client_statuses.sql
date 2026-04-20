DO $$
BEGIN
  -- Create client_statuses table
  CREATE TABLE IF NOT EXISTS public.client_statuses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL
  );

  -- Add status_id to clients
  ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS status_id TEXT REFERENCES public.client_statuses(id) ON DELETE SET NULL;

  -- Enable RLS
  ALTER TABLE public.client_statuses ENABLE ROW LEVEL SECURITY;
END $$;

-- RLS
DROP POLICY IF EXISTS "authenticated_select_client_statuses" ON public.client_statuses;
CREATE POLICY "authenticated_select_client_statuses" ON public.client_statuses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_client_statuses" ON public.client_statuses;
CREATE POLICY "authenticated_insert_client_statuses" ON public.client_statuses FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_client_statuses" ON public.client_statuses;
CREATE POLICY "authenticated_update_client_statuses" ON public.client_statuses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_client_statuses" ON public.client_statuses;
CREATE POLICY "authenticated_delete_client_statuses" ON public.client_statuses FOR DELETE TO authenticated USING (true);

-- Seed data
INSERT INTO public.client_statuses (id, name, color) VALUES
  ('prospect', 'Prospect', '#3b82f6'),
  ('active', 'Ativo', '#22c55e'),
  ('inactive', 'Inativo', '#ef4444'),
  ('blocked', 'Bloqueado', '#f59e0b')
ON CONFLICT (id) DO NOTHING;

-- Default existing clients to 'active'
UPDATE public.clients SET status_id = 'active' WHERE status_id IS NULL;
