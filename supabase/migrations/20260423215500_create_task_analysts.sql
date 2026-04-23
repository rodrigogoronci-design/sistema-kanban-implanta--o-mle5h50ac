CREATE TABLE IF NOT EXISTS public.task_analysts (
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    analyst_id UUID NOT NULL REFERENCES public.analistas(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, analyst_id)
);

DROP POLICY IF EXISTS "authenticated_select_task_analysts" ON public.task_analysts;
CREATE POLICY "authenticated_select_task_analysts" ON public.task_analysts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_task_analysts" ON public.task_analysts;
CREATE POLICY "authenticated_insert_task_analysts" ON public.task_analysts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_task_analysts" ON public.task_analysts;
CREATE POLICY "authenticated_update_task_analysts" ON public.task_analysts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_task_analysts" ON public.task_analysts;
CREATE POLICY "authenticated_delete_task_analysts" ON public.task_analysts FOR DELETE TO authenticated USING (true);

ALTER TABLE public.task_analysts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Backfill data from tasks.responsible_id
  INSERT INTO public.task_analysts (task_id, analyst_id)
  SELECT id, responsible_id FROM public.tasks WHERE responsible_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END $$;
