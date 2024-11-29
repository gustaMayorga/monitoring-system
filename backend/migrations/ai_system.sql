-- Tabla para almacenar el historial de análisis de IA
CREATE TABLE IF NOT EXISTS ai_analysis_history (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- ticket, service, event, etc.
    entity_id INTEGER NOT NULL,
    analysis_type VARCHAR(50) NOT NULL, -- solution_prediction, time_estimation, etc.
    input_data JSONB,
    output_data JSONB,
    confidence_score DECIMAL(5,2),
    execution_time INTEGER, -- en milisegundos
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar el entrenamiento del modelo
CREATE TABLE IF NOT EXISTS ai_training_data (
    id SERIAL PRIMARY KEY,
    data_type VARCHAR(50) NOT NULL,
    input_features JSONB,
    output_labels JSONB,
    source VARCHAR(50), -- manual, automatic, validated
    validation_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para sugerencias de IA
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    suggestion_type VARCHAR(50) NOT NULL,
    suggestion_text TEXT,
    confidence_score DECIMAL(5,2),
    applied BOOLEAN DEFAULT FALSE,
    applied_by INTEGER REFERENCES users(id),
    applied_at TIMESTAMP WITH TIME ZONE,
    feedback_score INTEGER,
    feedback_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para configuración de modelos de IA
CREATE TABLE IF NOT EXISTS ai_model_configs (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    parameters JSONB,
    active BOOLEAN DEFAULT TRUE,
    last_training_date TIMESTAMP WITH TIME ZONE,
    performance_metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para caché de embeddings
CREATE TABLE IF NOT EXISTS ai_embeddings_cache (
    id SERIAL PRIMARY KEY,
    text_hash VARCHAR(64) UNIQUE NOT NULL,
    original_text TEXT,
    embedding VECTOR(384), -- Ajustar dimensión según el modelo
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ai_analysis_entity ON ai_analysis_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis_history(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_entity ON ai_suggestions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON ai_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ai_training_data_type ON ai_training_data(data_type);
CREATE INDEX IF NOT EXISTS idx_ai_embeddings_hash ON ai_embeddings_cache(text_hash);

-- Funciones para similitud de texto
CREATE OR REPLACE FUNCTION cosine_similarity(a VECTOR, b VECTOR) 
RETURNS FLOAT AS $$
BEGIN
    RETURN (a <#> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT;

-- Vista para estadísticas de rendimiento de IA
CREATE OR REPLACE VIEW v_ai_performance_stats AS
SELECT 
    entity_type,
    analysis_type,
    COUNT(*) as total_analyses,
    AVG(confidence_score) as avg_confidence,
    AVG(execution_time) as avg_execution_time,
    MIN(created_at) as first_analysis,
    MAX(created_at) as last_analysis
FROM ai_analysis_history
GROUP BY entity_type, analysis_type; 