-- Add status_id column to projetos_implantacao
ALTER TABLE public.projetos_implantacao
  ADD COLUMN IF NOT EXISTS status_id TEXT REFERENCES public.project_statuses(id) ON DELETE SET NULL;

-- Seed 5 standard statuses (idempotent)
INSERT INTO public.project_statuses (id, name, color) VALUES
  ('backlog', 'Backlog', '#6b7280'),
  ('em-andamento', 'Em Andamento', '#3b82f6'),
  ('treinamento', 'Treinamento', '#f59e0b'),
  ('operacao-assistida', 'Operação Assistida', '#8b5cf6'),
  ('concluido', 'Concluído', '#22c55e')
ON CONFLICT (id) DO NOTHING;

-- Migrate: rows with migrated_from_id, copy status_id from projects
UPDATE public.projetos_implantacao pi
SET status_id = p.status_id
FROM public.projects p
WHERE pi.migrated_from_id = p.id
  AND pi.status_id IS NULL
  AND p.status_id IS NOT NULL;

-- Migrate remaining rows by mapping text status
UPDATE public.projetos_implantacao
SET status_id = 'em-andamento'
WHERE status_id IS NULL AND status = 'Ativo';

UPDATE public.projetos_implantacao
SET status_id = 'concluido'
WHERE status_id IS NULL AND status = 'Concluído';

UPDATE public.projetos_implantacao
SET status_id = 'backlog'
WHERE status_id IS NULL AND status IN ('Pausado', 'Cancelado');

-- Fallback: any remaining NULL becomes backlog
UPDATE public.projetos_implantacao
SET status_id = 'backlog'
WHERE status_id IS NULL;

-- Ensure RLS policies (idempotent)
DROP POLICY IF EXISTS "authenticated_select" ON public.projetos_implantacao;
CREATE POLICY "authenticated_select" ON public.projetos_implantacao
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.projetos_implantacao;
CREATE POLICY "authenticated_insert" ON public.projetos_implantacao
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.projetos_implantacao;
CREATE POLICY "authenticated_update" ON public.projetos_implantacao
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.projetos_implantacao;
CREATE POLICY "authenticated_delete" ON public.projetos_implantacao
  FOR DELETE TO authenticated USING (true);
