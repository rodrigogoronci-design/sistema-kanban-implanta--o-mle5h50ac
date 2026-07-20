ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS data_demanda DATE;
ALTER TABLE public.projetos_implantacao ADD COLUMN IF NOT EXISTS analyst_id UUID REFERENCES public.analistas(id) ON DELETE SET NULL;
