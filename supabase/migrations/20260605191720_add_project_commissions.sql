ALTER TABLE IF EXISTS public.projects 
  ADD COLUMN IF NOT EXISTS generates_commission BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS commission_status TEXT DEFAULT 'Pendente';

-- Seed data for testing: set the first 3 projects to generate commission
DO $$
BEGIN
  UPDATE public.projects 
  SET generates_commission = true, 
      commission_status = 'Pendente'
  WHERE id IN (
    SELECT id FROM public.projects 
    LIMIT 3
  );
END $$;
