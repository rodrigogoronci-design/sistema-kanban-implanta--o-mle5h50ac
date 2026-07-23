-- Add is_new_client column to projetos_implantacao
ALTER TABLE public.projetos_implantacao 
  ADD COLUMN IF NOT EXISTS is_new_client BOOLEAN NOT NULL DEFAULT false;

-- Add tracking columns for migration traceability
ALTER TABLE public.projetos_implantacao 
  ADD COLUMN IF NOT EXISTS migrated_from_id UUID;

ALTER TABLE public.projeto_atividades 
  ADD COLUMN IF NOT EXISTS migrated_from_task_id UUID;

-- Create unique partial indexes for idempotent migration
CREATE UNIQUE INDEX IF NOT EXISTS idx_projetos_implantacao_migrated_from_id
  ON public.projetos_implantacao (migrated_from_id)
  WHERE migrated_from_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_projeto_atividades_migrated_from_task_id
  ON public.projeto_atividades (migrated_from_task_id)
  WHERE migrated_from_task_id IS NOT NULL;
