ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_time TIME;
