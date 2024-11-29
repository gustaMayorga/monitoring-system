import os

def load_env():
    """Carga las variables de entorno con valores por defecto"""
    env_vars = {
        # Database Configuration
        'DB_NAME': 'monitoring_db',
        'DB_USER': 'postgres',
        'DB_PASSWORD': 'veoveo77',
        'DB_HOST': 'localhost',
        'DB_PORT': '5432',

        # JWT Configuration
        'JWT_SECRET': 'tu_clave_secreta_muy_segura',
        'ACCESS_TOKEN_EXPIRE_MINUTES': '30',

        # Server Configuration
        'DEBUG': 'true',
        'ALLOWED_ORIGINS': 'http://localhost:5173,http://127.0.0.1:5173',

        # Application Settings
        'APP_NAME': 'MonitoringApp',
        'APP_VERSION': '1.0.0'
    }

    # Solo establecer variables que no existan
    for key, value in env_vars.items():
        if key not in os.environ:
            os.environ[key] = value

# Cargar variables de entorno al importar el módulo
load_env() 