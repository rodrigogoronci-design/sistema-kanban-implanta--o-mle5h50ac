CREATE TABLE IF NOT EXISTS public.analistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    especialidade TEXT,
    user_id UUID REFERENCES public.colaboradores(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Ativo' NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_analistas" ON public.analistas;
CREATE POLICY "authenticated_select_analistas" ON public.analistas FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_analistas" ON public.analistas;
CREATE POLICY "authenticated_insert_analistas" ON public.analistas FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_analistas" ON public.analistas;
CREATE POLICY "authenticated_update_analistas" ON public.analistas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_analistas" ON public.analistas;
CREATE POLICY "authenticated_delete_analistas" ON public.analistas FOR DELETE TO authenticated USING (true);

DO $$
BEGIN
  INSERT INTO public.analistas (id, nome, user_id)
  SELECT c.id, c.nome, c.id
  FROM public.colaboradores c
  WHERE c.id IN (
    SELECT p.analyst_id FROM public.projects p WHERE p.analyst_id IS NOT NULL
    UNION
    SELECT t.responsible_id FROM public.tasks t WHERE t.responsible_id IS NOT NULL
  )
  ON CONFLICT (id) DO NOTHING;
END $$;

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_analyst_id_fkey;
ALTER TABLE public.projects ADD CONSTRAINT projects_analyst_id_fkey FOREIGN KEY (analyst_id) REFERENCES public.analistas(id) ON DELETE SET NULL;

ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_responsible_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_responsible_id_fkey FOREIGN KEY (responsible_id) REFERENCES public.analistas(id) ON DELETE SET NULL;
