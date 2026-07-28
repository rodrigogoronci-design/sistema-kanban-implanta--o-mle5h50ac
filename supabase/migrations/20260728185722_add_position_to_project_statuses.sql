-- Add position column to project_statuses for display ordering
ALTER TABLE public.project_statuses ADD COLUMN IF NOT EXISTS position integer;

-- Set positions for the five official statuses (case-insensitive, only if position is NULL)
UPDATE public.project_statuses SET position = 1 WHERE LOWER(name) = 'backlog' AND position IS NULL;
UPDATE public.project_statuses SET position = 2 WHERE LOWER(name) = 'em andamento' AND position IS NULL;
UPDATE public.project_statuses SET position = 3 WHERE LOWER(name) = 'treinamento' AND position IS NULL;
UPDATE public.project_statuses SET position = 4 WHERE LOWER(name) = 'operação assistida' AND position IS NULL;
UPDATE public.project_statuses SET position = 5 WHERE LOWER(name) = 'concluído' AND position IS NULL;

-- Set default high position for any remaining NULL statuses so they appear last
UPDATE public.project_statuses SET position = 999 WHERE position IS NULL;

-- Ensure unique constraint on name exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'project_statuses_name_unique'
    AND conrelid = 'public.project_statuses'::regclass
  ) THEN
    ALTER TABLE public.project_statuses ADD CONSTRAINT project_statuses_name_unique UNIQUE (name);
  END IF;
END $$;

-- Create index on position for efficient sorting
CREATE INDEX IF NOT EXISTS idx_project_statuses_position ON public.project_statuses (position);
