ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_date date;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_time time;
