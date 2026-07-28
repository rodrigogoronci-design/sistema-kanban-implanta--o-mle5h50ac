-- Ensure ON DELETE CASCADE on projeto_atividades.project_id → projetos_implantacao.id
ALTER TABLE public.projeto_atividades
  DROP CONSTRAINT IF EXISTS projeto_atividades_project_id_fkey;

ALTER TABLE public.projeto_atividades
  ADD CONSTRAINT projeto_atividades_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projetos_implantacao(id) ON DELETE CASCADE;

-- Ensure ON DELETE CASCADE on jornada_etapas.project_id → projetos_implantacao.id
ALTER TABLE public.jornada_etapas
  DROP CONSTRAINT IF EXISTS jornada_etapas_project_id_fkey;

ALTER TABLE public.jornada_etapas
  ADD CONSTRAINT jornada_etapas_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES public.projetos_implantacao(id) ON DELETE CASCADE;
