DO $$
BEGIN
  UPDATE public.projects
  SET generates_commission = false
  WHERE generates_commission IS NULL;

  UPDATE public.projects
  SET commission_status = 'Pendente'
  WHERE commission_status IS NULL;
END $$;
