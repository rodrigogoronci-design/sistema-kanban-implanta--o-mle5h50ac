DO $$
BEGIN
  -- Ensures existing projects that generate commission have a valid commission status
  UPDATE public.projects
  SET commission_status = 'Pendente'
  WHERE generates_commission = true 
    AND (commission_status IS NULL OR commission_status = '');
END $$;
