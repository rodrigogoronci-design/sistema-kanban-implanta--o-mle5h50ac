DO $$
DECLARE
  current_permissions jsonb;
  updated_permissions jsonb;
BEGIN
  SELECT valor INTO current_permissions
  FROM public.configuracoes
  WHERE chave = 'role_permissions';

  IF current_permissions IS NOT NULL THEN
    updated_permissions := current_permissions;

    IF updated_permissions ? 'Administrador' THEN
      IF NOT (updated_permissions->'Administrador') ? '/jornadas' THEN
        updated_permissions := jsonb_set(
          updated_permissions,
          '{Administrador}',
          (updated_permissions->'Administrador') || '["/jornadas"]'::jsonb
        );
      END IF;
      IF NOT (updated_permissions->'Administrador') ? '/projetos-implantacao' THEN
        updated_permissions := jsonb_set(
          updated_permissions,
          '{Administrador}',
          (updated_permissions->'Administrador') || '["/projetos-implantacao"]'::jsonb
        );
      END IF;
    END IF;

    IF updated_permissions ? 'Gerente' THEN
      IF NOT (updated_permissions->'Gerente') ? '/jornadas' THEN
        updated_permissions := jsonb_set(
          updated_permissions,
          '{Gerente}',
          (updated_permissions->'Gerente') || '["/jornadas"]'::jsonb
        );
      END IF;
      IF NOT (updated_permissions->'Gerente') ? '/projetos-implantacao' THEN
        updated_permissions := jsonb_set(
          updated_permissions,
          '{Gerente}',
          (updated_permissions->'Gerente') || '["/projetos-implantacao"]'::jsonb
        );
      END IF;
    END IF;

    UPDATE public.configuracoes
    SET valor = updated_permissions
    WHERE chave = 'role_permissions';
  ELSE
    INSERT INTO public.configuracoes (chave, valor)
    VALUES (
      'role_permissions',
      '{
        "Administrador": ["/", "/clients", "/projects", "/comissoes", "/analysts", "/users", "/reports", "/cadastros", "/settings", "/monitoramento", "/jornadas", "/projetos-implantacao"],
        "Gerente": ["/", "/clients", "/projects", "/comissoes", "/analysts", "/reports", "/cadastros", "/monitoramento", "/jornadas", "/projetos-implantacao"],
        "Colaborador": ["/", "/projects", "/cadastros", "/monitoramento"]
      }'::jsonb
    )
    ON CONFLICT (chave) DO NOTHING;
  END IF;
END $$;
