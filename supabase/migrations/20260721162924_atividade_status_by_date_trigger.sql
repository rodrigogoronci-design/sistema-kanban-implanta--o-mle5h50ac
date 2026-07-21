CREATE OR REPLACE FUNCTION public.handle_atividade_status_by_date()
RETURNS trigger AS $$
BEGIN
  IF NEW.realization_date IS NOT NULL THEN
    NEW.status := 'Concluído';
    NEW.is_completed := true;
  ELSIF TG_OP = 'UPDATE' AND OLD.realization_date IS NOT NULL AND NEW.realization_date IS NULL THEN
    NEW.status := 'Em Andamento';
    NEW.is_completed := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_atividade_status_by_date ON public.projeto_atividades;

CREATE TRIGGER trg_atividade_status_by_date
  BEFORE INSERT OR UPDATE OF realization_date ON public.projeto_atividades
  FOR EACH ROW EXECUTE FUNCTION public.handle_atividade_status_by_date();

UPDATE public.projeto_atividades
SET status = 'Concluído', is_completed = true
WHERE realization_date IS NOT NULL AND (status <> 'Concluído' OR is_completed = false);

UPDATE public.projeto_atividade_time_entries
SET created_at = COALESCE(created_at, NOW())
WHERE created_at IS NULL;
