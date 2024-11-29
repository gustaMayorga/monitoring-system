from fastapi import FastAPI
from app.core.cors import setup_cors
from app.core.config import settings
from app.routes import (
    auth_router,
    camera_router,
    alarm_router,
    client_router,
    event_router
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API para Sistema de Seguridad Electrónica",
    version=settings.VERSION
)

# Configurar CORS
setup_cors(app)

# Rutas
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(camera_router, prefix="/api/cameras", tags=["Cameras"])
app.include_router(alarm_router, prefix="/api/alarms", tags=["Alarms"])
app.include_router(client_router, prefix="/api/clients", tags=["Clients"])
app.include_router(event_router, prefix="/api/events", tags=["Events"])