DO $$
BEGIN
  INSERT INTO public.modules (name) VALUES
    ('Financeiro'),
    ('Vendas'),
    ('Estoque'),
    ('Faturamento'),
    ('Contabilidade')
  ON CONFLICT (name) DO NOTHING;
END $$;
