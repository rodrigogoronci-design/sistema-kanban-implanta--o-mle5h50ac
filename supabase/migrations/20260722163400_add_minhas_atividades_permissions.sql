DO $$
BEGIN
  UPDATE configuracoes
  SET valor = (
    SELECT jsonb_object_agg(
      key,
      CASE
        WHEN value @> '"/minhas-atividades"'::jsonb
        THEN value
        ELSE value || '"/minhas-atividades"'::jsonb
      END
    )
    FROM jsonb_each(valor)
  )
  WHERE chave = 'role_permissions';
END $$;
