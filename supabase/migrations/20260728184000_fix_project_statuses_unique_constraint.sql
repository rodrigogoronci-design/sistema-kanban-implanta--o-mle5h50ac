-- Fix unique constraint on project_statuses.name
-- Previous migration 20260728183654 had a syntax error (missing closing paren in CREATE INDEX)
-- This migration ensures deduplication is complete and the unique index is created correctly

-- 1. Drop the potentially broken/incomplete index
DROP INDEX IF EXISTS project_statuses_name_unique_idx;

-- 2. Ensure the 5 standard statuses exist (idempotent)
INSERT INTO public.project_statuses (id, name, color) VALUES
  ('backlog', 'Backlog', '#6b7280'),
  ('em-andamento', 'Em Andamento', '#3b82f6'),
  ('treinamento', 'Treinamento', '#f59e0b'),
  ('operacao-assistida', 'Operação Assistida', '#8b5cf6'),
  ('concluido', 'Concluído', '#22c55e')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color;

-- 3. Consolidate any remaining duplicates by name (case-insensitive)
-- For each set of duplicates, keep the canonical/lowest id and remap references
DO $$
DECLARE
  r RECORD;
  canonical_id TEXT;
BEGIN
  FOR r IN
    SELECT ps.id AS dup_id, ps.name AS dup_name
    FROM public.project_statuses ps
    WHERE ps.id NOT IN (
      SELECT MIN(id) FROM public.project_statuses GROUP BY LOWER(TRIM(name))
    )
  LOOP
    SELECT MIN(id) INTO canonical_id
    FROM public.project_statuses
    WHERE LOWER(TRIM(name)) = LOWER(TRIM(r.dup_name))
      AND id <> r.dup_id;

    IF canonical_id IS NOT NULL THEN
      UPDATE public.projetos_implantacao
      SET status_id = canonical_id
      WHERE status_id = r.dup_id;

      UPDATE public.projects
      SET status_id = canonical_id
      WHERE status_id = r.dup_id;

      DELETE FROM public.project_statuses WHERE id = r.dup_id;
    END IF;
  END LOOP;
END $$;

-- 4. Create the unique index correctly (case-insensitive on trimmed name)
CREATE UNIQUE INDEX IF NOT EXISTS project_statuses_name_unique_idx
  ON public.project_statuses (LOWER(TRIM(name)));

-- 5. Ensure RLS policies are intact (idempotent)
DROP POLICY IF EXISTS "authenticated_select" ON public.project_statuses;
CREATE POLICY "authenticated_select" ON public.project_statuses
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert" ON public.project_statuses;
CREATE POLICY "authenticated_insert" ON public.project_statuses
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update" ON public.project_statuses;
CREATE POLICY "authenticated_update" ON public.project_statuses
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete" ON public.project_statuses;
CREATE POLICY "authenticated_delete" ON public.project_statuses
  FOR DELETE TO authenticated USING (true);
