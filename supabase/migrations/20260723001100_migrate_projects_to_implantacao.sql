-- Migration script: Copy projects/tasks/time_entries to projetos_implantacao/projeto_atividades/projeto_atividade_time_entries
-- This migration is idempotent and does NOT modify or delete any original data.

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
    -- Skip if already migrated
    IF EXISTS (SELECT 1 FROM public.projetos_implantacao WHERE migrated_from_id = proj.id) THEN
      CONTINUE;
    END IF;

    -- Insert into projetos_implantacao
    INSERT INTO public.projetos_implantacao (
      name, client_id, analyst_id, data_demanda, is_new_client,
      status, migrated_from_id
    )
    VALUES (
      proj.name,
      proj.client_id,
      proj.analyst_id,
      proj.forecast_start::date,
      COALESCE(proj.is_new_client, false),
      'Ativo',
      proj.id
    )
    RETURNING id INTO new_projeto_id;

    -- Create default "Geral" etapa linked to the new project
    INSERT INTO public.jornada_etapas (project_id, name, position)
    VALUES (new_projeto_id, 'Geral', 1)
    RETURNING id INTO etapa_id;

    -- Set current_step_id to the "Geral" etapa
    UPDATE public.projetos_implantacao
    SET current_step_id = etapa_id
    WHERE id = new_projeto_id;

    -- Copy tasks from the original project
    FOR task IN SELECT * FROM public.tasks WHERE project_id = proj.id LOOP
      -- Map status from column title
      col_title := NULL;
      SELECT title INTO col_title FROM public.columns WHERE id = task.column_id;

      mapped_status := CASE
        WHEN col_title ILIKE '%conclu%' OR col_title ILIKE '%done%' OR col_title ILIKE '%finalizad%' THEN 'Concluído'
        WHEN col_title ILIKE '%andamento%' OR col_title ILIKE '%progress%' OR col_title ILIKE '%fazendo%' THEN 'Em Andamento'
        ELSE 'A Fazer'
      END;

      -- Aggregate time entries for hours/minutes
      total_seconds := 0;
      SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))), 0)
      INTO total_seconds
      FROM public.time_entries
      WHERE task_id = task.id AND end_time IS NOT NULL;

      total_hours := (total_seconds / 3600)::INT;
      total_minutes := ((total_seconds % 3600) / 60)::INT;

      -- Insert into projeto_atividades
      INSERT INTO public.projeto_atividades (
        project_id, etapa_id, name, description, status, is_completed,
        hours_spent, minutes_spent, forecast_date, realization_date,
        responsible_id, is_extra, rat_url, migrated_from_task_id
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
        task.id
      )
      RETURNING id INTO new_atividade_id;

      -- Copy time entries
      FOR te IN SELECT * FROM public.time_entries WHERE task_id = task.id LOOP
        INSERT INTO public.projeto_atividade_time_entries (
          projeto_atividade_id, start_time, end_time, description
        )
        VALUES (
          new_atividade_id,
          te.start_time,
          COALESCE(te.end_time, te.start_time),
          te.observation
        );
      END LOOP;
    END LOOP;
  END LOOP;
END $$;
