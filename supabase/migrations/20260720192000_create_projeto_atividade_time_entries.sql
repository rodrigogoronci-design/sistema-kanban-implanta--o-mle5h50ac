CREATE TABLE IF NOT EXISTS public.projeto_atividade_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_atividade_id UUID NOT NULL REFERENCES public.projeto_atividades(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projeto_atividade_time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_pat_entries" ON public.projeto_atividade_time_entries;
CREATE POLICY "authenticated_select_pat_entries" ON public.projeto_atividade_time_entries
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_pat_entries" ON public.projeto_atividade_time_entries;
CREATE POLICY "authenticated_insert_pat_entries" ON public.projeto_atividade_time_entries
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_pat_entries" ON public.projeto_atividade_time_entries;
CREATE POLICY "authenticated_update_pat_entries" ON public.projeto_atividade_time_entries
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_pat_entries" ON public.projeto_atividade_time_entries;
CREATE POLICY "authenticated_delete_pat_entries" ON public.projeto_atividade_time_entries
  FOR DELETE TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_pat_entries_atividade_id ON public.projeto_atividade_time_entries(projeto_atividade_id);
