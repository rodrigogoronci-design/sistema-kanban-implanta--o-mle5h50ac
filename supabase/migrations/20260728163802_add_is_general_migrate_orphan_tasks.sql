-- Migration: Add is_general column, missing project fields, and migrate orphan tasks
-- This migration is idempotent and does NOT modify or delete any original data.

-- 1. Add is_general column to projetos_implantacao
ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS is_general BOOLEAN NOT NULL DEFAULT false;

-- 2. Add missing columns from projects to projetos_implantacao
ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS contracted_hours INTEGER;
ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS generates_commission BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS commission_status TEXT NOT NULL DEFAULT 'Pendente';

-- 3. Add priority column to projeto_atividades (to preserve task priority)
ALTER TABLE public.projeto_atividades ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'Média';

-- 4. Drop FK on attachments.task_id to allow referencing projeto_atividades
ALTER TABLE public.attachments DROP CONSTRAINT IF EXISTS attachments_task_id_fkey;

-- 5. Update already-migrated projetos_implantacao with missing fields from projects
UPDATE public.projetos_implantacao pi
SET
  priority = COALESCE(p.priority, pi.priority),
  forecast_start = COALESCE(p.forecast_start, pi.forecast_start),
  forecast_end = COALESCE(p.forecast_end, pi.forecast_end),
  contracted_hours = COALESCE(p.contracted_hours, pi.contracted_hours),
  generates_commission = COALESCE(p.generates_commission, pi.generates_commission),
  commission_status = COALESCE(p.commission_status, pi.commission_status),
  notes = COALESCE(p.notes, pi.notes)
FROM public.projects p
WHERE pi.migrated_from_id = p.id;

-- 6. Update already-migrated projeto_atividades with priority from tasks
UPDATE public.projeto_atividades pa
SET priority = COALESCE(t.priority, pa.priority)
FROM public.tasks t
WHERE pa.migrated_from_task_id = t.id AND t.priority IS NOT NULL;

-- 7. Migrate any projects not yet migrated (with all fields)
DO $$
DECLARE
  proj RECORD;
  new_projeto_id UUID;
  etapa_id UUID;
  task RECORD;
  new_atividade_id UUID;
  te RECORD;
  col_title TEXT;
  mapped_status TEXT;
  total_seconds NUMERIC;
  total_hours INT;
  total_minutes INT;
BEGIN
  FOR proj IN SELECT * FROM public.projects LOOP
    IF EXISTS (SELECT 1 FROM public.projetos_implantacao WHERE migrated_from_id = proj.id) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.projetos_implantacao (
      name, client_id, analyst_id, data_demanda, is_new_client,
      status, migrated_from_id, priority, forecast_start, forecast_end,
      contracted_hours, generates_commission, commission_status, notes
    )
    VALUES (
      proj.name,
      proj.client_id,
      proj.analyst_id,
      proj.forecast_start::date,
      COALESCE(proj.is_new_client, false),
      'Ativo',
      proj.id,
      COALESCE(proj.priority, 'Média'),
      proj.forecast_start,
      proj.forecast_end,
      proj.contracted_hours,
      COALESCE(proj.generates_commission, false),
      COALESCE(proj.commission_status, 'Pendente'),
      proj.notes
    )
    RETURNING id INTO new_projeto_id;

    INSERT INTO public.jornada_etapas (project_id, name, position)
    VALUES (new_projeto_id, 'Geral', 1)
    RETURNING id INTO etapa_id;

    UPDATE public.projetos_implantacao
    SET current_step_id = etapa_id
    WHERE id = new_projeto_id;

    FOR task IN SELECT * FROM public.tasks WHERE project_id = proj.id LOOP
      col_title := NULL;
      SELECT title INTO col_title FROM public.columns WHERE id = task.column_id;

      mapped_status := CASE
        WHEN col_title ILIKE '%conclu%' OR col_title ILIKE '%done%' OR col_title ILIKE '%finalizad%' THEN 'Concluído'
        WHEN col_title ILIKE '%andamento%' OR col_title ILIKE '%progress%' OR col_title ILIKE '%fazendo%' THEN 'Em Andamento'
        ELSE 'A Fazer'
      END;

      total_seconds := 0;
      SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))), 0)
      INTO total_seconds
      FROM public.time_entries
      WHERE task_id = task.id AND end_time IS NOT NULL;

      total_hours := (total_seconds / 3600)::INT;
      total_minutes := ((total_seconds % 3600) / 60)::INT;

      INSERT INTO public.projeto_atividades (
        project_id, etapa_id, name, description, status, is_completed,
        hours_spent, minutes_spent, forecast_date, realization_date,
        responsible_id, is_extra, rat_url, migrated_from_task_id, priority
      )
      VALUES (
        new_projeto_id,
        etapa_id,
        task.title,
        task.description,
        mapped_status,
        task.completion_date IS NOT NULL,
        total_hours,
        total_minutes,
        task.due_date::date,
        task.completion_date::date,
        task.responsible_id,
        false,
        NULL,
        task.id,
        COALESCE(task.priority, 'Média')
      )
      RETURNING id INTO new_atividade_id;

      FOR te IN SELECT * FROM public.time_entries WHERE task_id = task.id LOOP
        INSERT INTO public.projeto_atividade_time_entries (
          projeto_atividade_id, start_time, end_time, description
        )
        VALUES (
          new_atividade_id,
          te.start_time,
          COALESCE(te.end_time, te.start_time),
          te.observation
        )
        ON CONFLICT DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- 8. Create "Geral — Área de Trabalho" project and migrate orphan tasks
DO $$
DECLARE
  geral_project_id UUID;
  geral_etapa_id UUID;
  task RECORD;
  new_atividade_id UUID;
  te RECORD;
  att RECORD;
  col_title TEXT;
  mapped_status TEXT;
  total_seconds NUMERIC;
  total_hours INT;
  total_minutes INT;
BEGIN
  SELECT id INTO geral_project_id FROM public.projetos_implantacao WHERE is_general = true LIMIT 1;

  IF geral_project_id IS NULL THEN
    INSERT INTO public.projetos_implantacao (name, status, is_general, client_id, analyst_id)
    VALUES ('Geral — Área de Trabalho', 'Ativo', true, NULL, NULL)
    RETURNING id INTO geral_project_id;
  END IF;

  SELECT id INTO geral_etapa_id FROM public.jornada_etapas WHERE project_id = geral_project_id LIMIT 1;

  IF geral_etapa_id IS NULL THEN
    INSERT INTO public.jornada_etapas (project_id, name, position)
    VALUES (geral_project_id, 'Geral', 1)
    RETURNING id INTO geral_etapa_id;
  END IF;

  UPDATE public.projetos_implantacao
  SET current_step_id = geral_etapa_id
  WHERE id = geral_project_id AND current_step_id IS NULL;

  FOR task IN SELECT * FROM public.tasks WHERE project_id IS NULL LOOP
    IF EXISTS (SELECT 1 FROM public.projeto_atividades WHERE migrated_from_task_id = task.id) THEN
      CONTINUE;
    END IF;

    col_title := NULL;
    SELECT title INTO col_title FROM public.columns WHERE id = task.column_id;

    mapped_status := CASE
      WHEN col_title ILIKE '%conclu%' OR col_title ILIKE '%done%' OR col_title ILIKE '%finalizad%' THEN 'Concluído'
      WHEN col_title ILIKE '%andamento%' OR col_title ILIKE '%progress%' OR col_title ILIKE '%fazendo%' THEN 'Em Andamento'
      ELSE 'A Fazer'
    END;

    total_seconds := 0;
    SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))), 0)
    INTO total_seconds
    FROM public.time_entries
    WHERE task_id = task.id AND end_time IS NOT NULL;

    total_hours := (total_seconds / 3600)::INT;
    total_minutes := ((total_seconds % 3600) / 60)::INT;

    INSERT INTO public.projeto_atividades (
      project_id, etapa_id, name, description, status, is_completed,
      hours_spent, minutes_spent, forecast_date, realization_date,
      responsible_id, is_extra, rat_url, migrated_from_task_id, priority
    )
    VALUES (
      geral_project_id,
      geral_etapa_id,
      task.title,
      task.description,
      mapped_status,
      task.completion_date IS NOT NULL,
      total_hours,
      total_minutes,
      task.due_date::date,
      task.completion_date::date,
      task.responsible_id,
      false,
      NULL,
      task.id,
      COALESCE(task.priority, 'Média')
    )
    RETURNING id INTO new_atividade_id;

    FOR te IN SELECT * FROM public.time_entries WHERE task_id = task.id LOOP
      INSERT INTO public.projeto_atividade_time_entries (
        projeto_atividade_id, start_time, end_time, description
      )
      VALUES (
        new_atividade_id,
        te.start_time,
        COALESCE(te.end_time, te.start_time),
        te.observation
      )
      ON CONFLICT DO NOTHING;
    END LOOP;

    FOR att IN SELECT * FROM public.attachments WHERE task_id = task.id LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.attachments
        WHERE url = att.url AND task_id = new_atividade_id AND name = att.name
      ) THEN
        INSERT INTO public.attachments (name, url, size, type, task_id)
        VALUES (att.name, att.url, att.size, att.type, new_atividade_id);
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- 9. Migrate attachments for all previously migrated tasks (project-linked)
DO $$
DECLARE
  pa RECORD;
  att RECORD;
BEGIN
  FOR pa IN SELECT id, migrated_from_task_id FROM public.projeto_atividades WHERE migrated_from_task_id IS NOT NULL LOOP
    FOR att IN SELECT * FROM public.attachments WHERE task_id = pa.migrated_from_task_id LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.attachments
        WHERE url = att.url AND task_id = pa.id AND name = att.name
      ) THEN
        INSERT INTO public.attachments (name, url, size, type, task_id)
        VALUES (att.name, att.url, att.size, att.type, pa.id);
      END IF;
    END LOOP;
  END LOOP;
END $$;
