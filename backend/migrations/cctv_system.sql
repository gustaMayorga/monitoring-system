-- Tabla para DVRs/NVRs
CREATE TABLE IF NOT EXISTS recording_devices (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    name VARCHAR(100) NOT NULL,
    device_type VARCHAR(20) NOT NULL, -- DVR, NVR, etc.
    model VARCHAR(50),
    ip_address VARCHAR(45),
    port INTEGER,
    username VARCHAR(50),
    password VARCHAR(100),
    channels INTEGER,
    storage_capacity INTEGER, -- en GB
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_connection TIMESTAMP WITH TIME ZONE
);

-- Tabla para cámaras
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES recording_devices(id),
    channel_number INTEGER NOT NULL,
    name VARCHAR(100),
    camera_type VARCHAR(50), -- PTZ, Fija, etc.
    resolution VARCHAR(20),
    location TEXT,
    stream_url TEXT,
    status VARCHAR(20) DEFAULT 'offline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(device_id, channel_number)
);

-- Tabla para eventos de cámaras
CREATE TABLE IF NOT EXISTS camera_events (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER REFERENCES cameras(id),
    event_type VARCHAR(50), -- motion, video_loss, etc.
    description TEXT,
    snapshot_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para grabaciones
CREATE TABLE IF NOT EXISTS recordings (
    id SERIAL PRIMARY KEY,
    camera_id INTEGER REFERENCES cameras(id),
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    file_path TEXT,
    file_size INTEGER, -- en bytes
    event_id INTEGER REFERENCES camera_events(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_recording_devices_client_id ON recording_devices(client_id);
CREATE INDEX IF NOT EXISTS idx_cameras_device_id ON cameras(device_id);
CREATE INDEX IF NOT EXISTS idx_camera_events_camera_id ON camera_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_events_timestamp ON camera_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_recordings_camera_id ON recordings(camera_id);
CREATE INDEX IF NOT EXISTS idx_recordings_start_time ON recordings(start_time); 