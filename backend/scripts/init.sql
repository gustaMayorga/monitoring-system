-- Crear usuario si no existe
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'postgres') THEN
      CREATE ROLE postgres LOGIN PASSWORD 'postgres';
   END IF;
END
$do$;

-- Dar permisos necesarios
ALTER ROLE postgres WITH SUPERUSER; 