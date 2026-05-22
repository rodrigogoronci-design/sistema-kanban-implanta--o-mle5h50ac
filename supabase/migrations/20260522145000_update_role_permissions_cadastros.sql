DO $$
DECLARE
  v_valor jsonb;
  v_new_valor jsonb := '{}'::jsonb;
  v_key text;
  v_array jsonb;
  v_updated_array jsonb;
BEGIN
  SELECT valor INTO v_valor FROM public.configuracoes WHERE chave = 'role_permissions';
  
  IF v_valor IS NOT NULL THEN
    FOR v_key, v_array IN SELECT * FROM jsonb_each(v_valor) LOOP
      IF jsonb_typeof(v_array) = 'array' THEN
        SELECT jsonb_agg(DISTINCT elem) INTO v_updated_array FROM (
          SELECT jsonb_array_elements_text(v_array) AS elem
          UNION SELECT '/cadastros'
        ) t WHERE elem <> '/modules';
        
        v_new_valor := jsonb_set(v_new_valor, ARRAY[v_key], COALESCE(v_updated_array, '[]'::jsonb));
      ELSE
        v_new_valor := jsonb_set(v_new_valor, ARRAY[v_key], v_array);
      END IF;
    END LOOP;

    UPDATE public.configuracoes SET valor = v_new_valor WHERE chave = 'role_permissions';
  ELSE
    INSERT INTO public.configuracoes (chave, valor) VALUES (
      'role_permissions',
      '{
        "Administrador": ["/", "/clients", "/projects", "/analysts", "/users", "/reports", "/cadastros", "/settings"],
        "Gerente": ["/", "/clients", "/projects", "/analysts", "/reports", "/cadastros"],
        "Colaborador": ["/", "/projects", "/cadastros"]
      }'::jsonb
    ) ON CONFLICT (chave) DO NOTHING;
  END IF;
END $$;
