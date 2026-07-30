DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.columns WHERE title = 'A Fazer') THEN
    UPDATE public.columns
    SET archived = false
    WHERE title = 'A Fazer' AND archived = true;
  ELSE
    INSERT INTO public.columns (id, title, archived, position)
    SELECT
      'a-fazer',
      'A Fazer',
      false,
      COALESCE((SELECT MAX(position) FROM public.columns), -1) + 1
    WHERE NOT EXISTS (SELECT 1 FROM public.columns WHERE id = 'a-fazer');
  END IF;
END $$;
