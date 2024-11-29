-- Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de roles primero
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agregar columna last_login si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'last_login'
    ) THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100) NOT NULL,
    tax_id VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    client_number VARCHAR(20) UNIQUE NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    billing_type VARCHAR(1) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles predefinidos si no existen
INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'Administrador del sistema', '["admin:all"]'),
    ('administrative', 'Personal administrativo', '["clients:read", "clients:write", "reports:read", "reports:write"]'),
    ('operator', 'Operador de monitoreo', '["alarms:read", "alarms:write", "alarms:acknowledge", "cameras:read", "cameras:control"]'),
    ('technical', 'Personal técnico', '["technical:read", "technical:write", "cameras:read", "alarms:read"]')
ON CONFLICT (name) DO NOTHING;

-- Crear usuario admin por defecto si no existe
INSERT INTO users (username, password, role_id, is_active, must_change_password)
SELECT 'admin', 
       '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFpxzKHGOXP/IXm', 
       r.id,
       TRUE,
       TRUE
FROM roles r
WHERE r.name = 'admin'
AND NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
ON CONFLICT (username) DO NOTHING;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_clients_tax_id ON clients(tax_id);
CREATE INDEX IF NOT EXISTS idx_clients_client_number ON clients(client_number);

-- Crear tabla de dispositivos
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    status VARCHAR(20) NOT NULL DEFAULT 'inactive',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de alertas
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id),
    type VARCHAR(50) NOT NULL,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at); 