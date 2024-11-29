-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'
);

-- Insertar roles predefinidos
INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'Administrador del sistema', '["admin:all"]'),
    ('administrative', 'Personal administrativo', '["clients:read", "clients:write", "reports:read", "reports:write"]'),
    ('operator', 'Operador de monitoreo', '["alarms:read", "alarms:write", "alarms:acknowledge", "cameras:read", "cameras:control"]'),
    ('technical', 'Personal técnico', '["technical:read", "technical:write", "cameras:read", "alarms:read"]');

-- Actualizar tabla de usuarios
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES roles(id); 