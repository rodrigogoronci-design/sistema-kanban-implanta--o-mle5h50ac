DO $$
DECLARE
  current_val jsonb;
  admin_perms jsonb;
  gerente_perms jsonb;
BEGIN
  SELECT valor INTO current_val FROM public.configuracoes WHERE chave = 'role_permissions';
  
  IF current_val IS NOT NULL THEN
    -- Extract arrays
    admin_perms := current_val -> 'Administrador';
    gerente_perms := current_val -> 'Gerente';
    
    -- Append /analysts to Administrador if not exists
    IF admin_perms IS NOT NULL AND NOT admin_perms @> '["/analysts"]'::jsonb THEN
      current_val := jsonb_set(current_val, '{Administrador}', admin_perms || '["/analysts"]'::jsonb);
    END IF;

    -- Append /analysts to Gerente if not exists
    IF gerente_perms IS NOT NULL AND NOT gerente_perms @> '["/analysts"]'::jsonb THEN
      current_val := jsonb_set(current_val, '{Gerente}', gerente_perms || '["/analysts"]'::jsonb);
    END IF;
    
    UPDATE public.configuracoes SET valor = current_val WHERE chave = 'role_permissions';
  ELSE
    INSERT INTO public.configuracoes (chave, valor) VALUES (
      'role_permissions',
      '{
        "Administrador": ["/", "/clients", "/projects", "/analysts", "/users", "/reports"],
        "Gerente": ["/", "/clients", "/projects", "/analysts", "/reports"],
        "Colaborador": ["/", "/projects"]
      }'::jsonb
    );
  END IF;
END $$;
