-- Crear tablas si no existen
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    tax_id VARCHAR(20) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    client_number VARCHAR(20) UNIQUE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    billing_type VARCHAR(10)
);

CREATE TABLE IF NOT EXISTS alarm_panels (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    account_number VARCHAR(20) UNIQUE NOT NULL,
    verification_code VARCHAR(50) NOT NULL,
    panel_type VARCHAR(50) NOT NULL,
    model VARCHAR(50),
    phone_line1 VARCHAR(20),
    phone_line2 VARCHAR(20),
    ip_address VARCHAR(45),
    port INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_connection TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS panel_zones (
    id SERIAL PRIMARY KEY,
    panel_id INTEGER REFERENCES alarm_panels(id),
    zone_number INTEGER NOT NULL,
    description TEXT,
    zone_type VARCHAR(50),
    bypass_allowed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(panel_id, zone_number)
);

CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    panel_id INTEGER REFERENCES alarm_panels(id),
    event_type VARCHAR(10) NOT NULL,
    raw_message TEXT NOT NULL,
    code VARCHAR(10) NOT NULL,
    qualifier CHAR(1),
    event_code VARCHAR(10),
    partition VARCHAR(10),
    zone_user VARCHAR(10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 3
);

CREATE TABLE IF NOT EXISTS event_logs (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    operator_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para códigos de eventos (SIA y CID)
CREATE TABLE IF NOT EXISTS event_codes (
    id SERIAL PRIMARY KEY,
    protocol VARCHAR(10) NOT NULL, -- SIA o CID
    code VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    priority INTEGER DEFAULT 3,
    requires_action BOOLEAN DEFAULT TRUE,
    UNIQUE(protocol, code)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_events_panel_id ON events(panel_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_processed ON events(processed);
CREATE INDEX IF NOT EXISTS idx_event_logs_event_id ON event_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_alarm_panels_client_id ON alarm_panels(client_id);
CREATE INDEX IF NOT EXISTS idx_alarm_panels_account_number ON alarm_panels(account_number);

-- Insertar algunos códigos de eventos comunes
INSERT INTO event_codes (protocol, code, description, priority) VALUES
('CID', '1130', 'Alarma de robo', 1),
('CID', '3130', 'Restauración de robo', 2),
('CID', '1110', 'Alarma de incendio', 1),
('CID', '3110', 'Restauración de incendio', 2),
('CID', '1301', 'Corte de AC', 2),
('CID', '3301', 'Restauración de AC', 3),
('CID', '1384', 'Batería baja', 2),
('CID', '3384', 'Restauración de batería', 3),
('SIA', 'BA', 'Alarma de robo', 1),
('SIA', 'BR', 'Restauración de robo', 2),
('SIA', 'FA', 'Alarma de incendio', 1),
('SIA', 'FR', 'Restauración de incendio', 2),
('SIA', 'AT', 'Problema de AC', 2),
('SIA', 'AR', 'Restauración de AC', 3),
('SIA', 'YT', 'Problema de batería', 2),
('SIA', 'YR', 'Restauración de batería', 3)
ON CONFLICT (protocol, code) DO NOTHING; 