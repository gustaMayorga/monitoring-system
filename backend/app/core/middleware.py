# backend/app/core/middleware.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.sessions import SessionMiddleware
from .config import settings

def setup_middleware(app: FastAPI) -> None:
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Compresión Gzip
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Sesiones
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.SECRET_KEY
    )