-- Add client_id column to projeto_atividades
ALTER TABLE public.projeto_atividades
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_projeto_atividades_client_id
  ON public.projeto_atividades (client_id)
  WHERE client_id IS NOT NULL;

-- Migrate client_id from tasks for records with migrated_from_task_id
UPDATE public.projeto_atividades
SET client_id = t.client_id
FROM public.tasks t
WHERE projeto_atividades.migrated_from_task_id = t.id
  AND projeto_atividades.client_id IS NULL
  AND t.client_id IS NOT NULL;
