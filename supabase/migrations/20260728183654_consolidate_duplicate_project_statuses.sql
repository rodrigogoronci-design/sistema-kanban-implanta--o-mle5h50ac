-- Consolidate duplicate project_statuses and add UNIQUE constraint on name

-- 1. Create a mapping table of non-canonical -> canonical status IDs
CREATE TEMP TABLE IF NOT EXISTS _status_dedup_map AS
WITH canonical_ids AS (
  SELECT name, id AS canonical_id
  FROM public.project_statuses
  WHERE id IN ('backlog', 'em-andamento', 'treinamento', 'operacao-assistida', 'concluido')
),
-- For names that don't have a canonical ID, pick the first one alphabetically by id
fallback_canonical AS (
  SELECT name, MIN(id) AS canonical_id
  FROM public.project_statuses
  WHERE name NOT IN (SELECT name FROM canonical_ids)
  GROUP BY name
),
all_canonical AS (
  SELECT name, canonical_id FROM canonical_ids
  UNION
  SELECT name, canonical_id FROM fallback_canonical
)
SELECT
  ps.id AS non_canonical_id,
  ac.canonical_id
FROM public.project_statuses ps
JOIN all_canonical ac ON LOWER(TRIM(ps.name)) = LOWER(TRIM(ac.name))
WHERE ps.id <> ac.canonical_id;

-- 2. Update projetos_implantacao references
UPDATE public.projetos_implantacao
SET status_id = m.canonical_id
FROM _status_dedup_map m
WHERE projetos_implantacao.status_id = m.non_canonical_id;

-- 3. Update projects references
UPDATE public.projects
SET status_id = m.canonical_id
FROM _status_dedup_map m
WHERE projects.status_id = m.non_canonical_id;

-- 4. Delete non-canonical duplicate statuses
DELETE FROM public.project_statuses
WHERE id IN (SELECT non_canonical_id FROM _status_dedup_map);

-- 5. Ensure the 5 standard statuses exist (idempotent)
INSERT INTO public.project_statuses (id, name, color) VALUES
  ('backlog', 'Backlog', '#6b7280'),
  ('em-andamento', 'Em Andamento', '#3b82f6'),
  ('treinamento', 'Treinamento', '#f59e0b'),
  ('operacao-assistida', 'Operação Assistida', '#8b5cf6'),
  ('concluido', 'Concluído', '#22c55e')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color;

-- 6. Clean up any remaining duplicates by name (keep lowest id)
DELETE FROM public.project_statuses
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.project_statuses
  GROUP BY LOWER(TRIM(name))
);

-- 7. Add UNIQUE constraint on name (case-insensitive via expression index)
-- First drop if exists
DROP INDEX IF EXISTS project_statuses_name_unique_idx;
CREATE UNIQUE INDEX IF NOT EXISTS project_statuses_name_unique_idx
  ON public.project_statuses (LOWER(TRIM(name));

-- 8. Ensure RLS policies are intact (idempotent)
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
