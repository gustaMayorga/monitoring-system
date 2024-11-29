from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    """Configuración de CORS para el sistema de seguridad electrónica"""
    
    origins = [
        # URLs de desarrollo
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Añade aquí las URLs de producción cuando estén disponibles
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=[
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS",
            "PATCH",
        ],
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-CSRF-Token",
        ],
        expose_headers=[
            "Content-Length",
            "X-CSRF-Token",
        ],
        max_age=3600,
    )