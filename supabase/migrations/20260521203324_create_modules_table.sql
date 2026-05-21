CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_select_modules" ON public.modules;
CREATE POLICY "authenticated_select_modules" ON public.modules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_insert_modules" ON public.modules;
CREATE POLICY "authenticated_insert_modules" ON public.modules FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_update_modules" ON public.modules;
CREATE POLICY "authenticated_update_modules" ON public.modules FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_modules" ON public.modules;
CREATE POLICY "authenticated_delete_modules" ON public.modules FOR DELETE TO authenticated USING (true);

-- Seed initial module data
INSERT INTO public.modules (name) VALUES
  ('Financeiro'), ('Comercial'), ('Faturamento'), ('Compras'),
  ('Estoque'), ('Fiscal'), ('Contábil'), ('RH'), ('Produção'), ('Gerencial')
ON CONFLICT (name) DO NOTHING;
