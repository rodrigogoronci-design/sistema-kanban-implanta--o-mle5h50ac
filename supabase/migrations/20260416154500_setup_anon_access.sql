-- Setup um administrador padrao caso nao exista
DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_admin_id FROM public.colaboradores WHERE role = 'Admin' LIMIT 1;
  IF v_admin_id IS NULL THEN
    INSERT INTO public.colaboradores (id, nome, role, email, status)
    VALUES (gen_random_uuid(), 'Administrador Padrão', 'Admin', 'admin@sistema.local', 'Ativo');
  END IF;
END $$;

-- Permitir acesso anonimo a todas as tabelas
DROP POLICY IF EXISTS "Allow all access to anon users" ON public.atestados;
CREATE POLICY "Allow all access to anon users" ON public.atestados FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.avaliacoes;
CREATE POLICY "Allow all access to anon users" ON public.avaliacoes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.beneficios_ticket;
CREATE POLICY "Allow all access to anon users" ON public.beneficios_ticket FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.beneficios_transporte;
CREATE POLICY "Allow all access to anon users" ON public.beneficios_transporte FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.colaboradores;
CREATE POLICY "Allow all access to anon users" ON public.colaboradores FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.configuracoes;
CREATE POLICY "Allow all access to anon users" ON public.configuracoes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.escala_mes;
CREATE POLICY "Allow all access to anon users" ON public.escala_mes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.faltas;
CREATE POLICY "Allow all access to anon users" ON public.faltas FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.feriados;
CREATE POLICY "Allow all access to anon users" ON public.feriados FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.ferias;
CREATE POLICY "Allow all access to anon users" ON public.ferias FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.historico_ajustes;
CREATE POLICY "Allow all access to anon users" ON public.historico_ajustes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.organizations;
CREATE POLICY "Allow all access to anon users" ON public.organizations FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.plantoes;
CREATE POLICY "Allow all access to anon users" ON public.plantoes FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.ponto;
CREATE POLICY "Allow all access to anon users" ON public.ponto FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.recrutamento;
CREATE POLICY "Allow all access to anon users" ON public.recrutamento FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to anon users" ON public.vagas;
CREATE POLICY "Allow all access to anon users" ON public.vagas FOR ALL TO anon USING (true) WITH CHECK (true);
