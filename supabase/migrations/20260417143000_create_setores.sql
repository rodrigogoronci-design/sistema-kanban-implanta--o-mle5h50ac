CREATE TABLE IF NOT EXISTS public.setores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_setores" ON public.setores;
CREATE POLICY "authenticated_select_setores" ON public.setores FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_setores" ON public.setores;
CREATE POLICY "authenticated_insert_setores" ON public.setores FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_setores" ON public.setores;
CREATE POLICY "authenticated_update_setores" ON public.setores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_setores" ON public.setores;
CREATE POLICY "authenticated_delete_setores" ON public.setores FOR DELETE TO authenticated USING (true);

ALTER TABLE public.colaboradores ADD COLUMN IF NOT EXISTS setor_id UUID REFERENCES public.setores(id) ON DELETE SET NULL;

DO $$
DECLARE
  dept_name TEXT;
  new_setor_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'colaboradores' AND column_name = 'departamento') THEN
    FOR dept_name IN SELECT DISTINCT departamento FROM public.colaboradores WHERE departamento IS NOT NULL AND departamento != '' LOOP
      INSERT INTO public.setores (nome) VALUES (dept_name) ON CONFLICT (nome) DO NOTHING;
      SELECT id INTO new_setor_id FROM public.setores WHERE nome = dept_name LIMIT 1;
      UPDATE public.colaboradores SET setor_id = new_setor_id WHERE departamento = dept_name;
    END LOOP;
  END IF;
END $$;
