DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projetos_implantacao','projeto_atividades'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "authenticated_delete" ON public.%I FOR DELETE TO authenticated USING (true)', t);
  END LOOP;
END $$;
