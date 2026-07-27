ALTER TABLE public.jornadas DROP CONSTRAINT IF EXISTS jornadas_client_id_fkey;
ALTER TABLE public.jornadas DROP COLUMN IF EXISTS client_id;
