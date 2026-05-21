DO $$
BEGIN
  ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS participants jsonb DEFAULT '[]'::jsonb;
  ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS trained_modules jsonb DEFAULT '[]'::jsonb;
END $$;
