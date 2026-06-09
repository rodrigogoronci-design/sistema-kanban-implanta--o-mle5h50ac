DO $$
BEGIN
  -- Standardize commission_status values for projects that generate commission
  UPDATE public.projects 
  SET commission_status = 'Pendente' 
  WHERE generates_commission = true 
    AND (commission_status IS NULL OR commission_status NOT IN ('Pendente', 'Pago'));

  -- Ensure commission_status is NULL for projects that do not generate commission
  UPDATE public.projects
  SET commission_status = NULL
  WHERE generates_commission = false OR generates_commission IS NULL;
END $$;
