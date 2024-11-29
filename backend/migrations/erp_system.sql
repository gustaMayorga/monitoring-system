-- Tabla para servicios técnicos
CREATE TABLE IF NOT EXISTS technical_services (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    service_type VARCHAR(50) NOT NULL, -- instalación, mantenimiento, reparación, etc.
    priority INTEGER DEFAULT 2, -- 1: alta, 2: media, 3: baja
    status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, in_progress, completed, cancelled
    description TEXT,
    estimated_duration INTEGER, -- en minutos
    scheduled_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    location_lat DECIMAL(10,8),
    location_lon DECIMAL(11,8),
    address TEXT
);

-- Tabla para técnicos
CREATE TABLE IF NOT EXISTS technicians (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    specialties TEXT[], -- array de especialidades
    rating DECIMAL(3,2),
    available BOOLEAN DEFAULT true,
    current_location_lat DECIMAL(10,8),
    current_location_lon DECIMAL(11,8),
    last_location_update TIMESTAMP WITH TIME ZONE
);

-- Tabla para asignaciones de servicios
CREATE TABLE IF NOT EXISTS service_assignments (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES technical_services(id),
    technician_id INTEGER REFERENCES technicians(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    estimated_arrival_time TIMESTAMP WITH TIME ZONE,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'assigned', -- assigned, en_route, on_site, completed
    notes TEXT
);

-- Tabla para materiales usados en servicios
CREATE TABLE IF NOT EXISTS service_materials (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES technical_services(id),
    material_id INTEGER REFERENCES inventory_items(id),
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    notes TEXT
);

-- Tabla para el inventario
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    unit VARCHAR(20),
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    supplier_id INTEGER REFERENCES suppliers(id),
    location VARCHAR(50), -- ubicación en almacén
    last_restock_date TIMESTAMP WITH TIME ZONE
);

-- Tabla para proveedores
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(20),
    payment_terms TEXT,
    rating INTEGER,
    active BOOLEAN DEFAULT true
);

-- Tabla para rutas de técnicos
CREATE TABLE IF NOT EXISTS technician_routes (
    id SERIAL PRIMARY KEY,
    technician_id INTEGER REFERENCES technicians(id),
    date DATE,
    start_location_lat DECIMAL(10,8),
    start_location_lon DECIMAL(11,8),
    end_location_lat DECIMAL(10,8),
    end_location_lon DECIMAL(11,8),
    total_distance DECIMAL(10,2), -- en kilómetros
    total_time INTEGER, -- en minutos
    status VARCHAR(20) DEFAULT 'planned' -- planned, in_progress, completed
);

-- Tabla para paradas en la ruta
CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES technician_routes(id),
    service_id INTEGER REFERENCES technical_services(id),
    stop_number INTEGER,
    estimated_arrival_time TIMESTAMP WITH TIME ZONE,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- en minutos
    actual_duration INTEGER, -- en minutos
    location_lat DECIMAL(10,8),
    location_lon DECIMAL(11,8),
    status VARCHAR(20) DEFAULT 'pending' -- pending, completed, skipped
);

-- Tabla para feedback de servicios
CREATE TABLE IF NOT EXISTS service_feedback (
    id SERIAL PRIMARY KEY,
    service_id INTEGER REFERENCES technical_services(id),
    client_id INTEGER REFERENCES clients(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_technical_services_client ON technical_services(client_id);
CREATE INDEX IF NOT EXISTS idx_technical_services_status ON technical_services(status);
CREATE INDEX IF NOT EXISTS idx_service_assignments_technician ON service_assignments(technician_id);
CREATE INDEX IF NOT EXISTS idx_technician_routes_date ON technician_routes(date);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON inventory_items(code);
CREATE INDEX IF NOT EXISTS idx_service_materials_service ON service_materials(service_id);

-- Vistas
CREATE OR REPLACE VIEW v_pending_services AS
SELECT 
    ts.*,
    c.name as client_name,
    c.phone as client_phone,
    c.address as client_address
FROM technical_services ts
JOIN clients c ON ts.client_id = c.id
WHERE ts.status = 'pending';

CREATE OR REPLACE VIEW v_technician_daily_schedule AS
SELECT 
    t.id as technician_id,
    u.username as technician_name,
    tr.date,
    rs.stop_number,
    rs.estimated_arrival_time,
    ts.service_type,
    ts.description,
    c.name as client_name,
    c.address as service_address
FROM technicians t
JOIN users u ON t.user_id = u.id
JOIN technician_routes tr ON t.id = tr.technician_id
JOIN route_stops rs ON tr.id = rs.route_id
JOIN technical_services ts ON rs.service_id = ts.id
JOIN clients c ON ts.client_id = c.id
WHERE tr.date = CURRENT_DATE
ORDER BY t.id, rs.stop_number; 