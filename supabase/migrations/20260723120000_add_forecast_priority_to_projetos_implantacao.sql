ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS forecast_start TIMESTAMPTZ;
ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS forecast_end TIMESTAMPTZ;
ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Média';
