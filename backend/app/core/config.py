from pydantic import BaseModel
from typing import List
import os

class Settings(BaseModel):
    # Database settings
    DB_NAME: str = 'monitoring_db'
    DB_USER: str = 'postgres'
    DB_PASSWORD: str = 'veoveo77'
    DB_HOST: str = 'localhost'
    DB_PORT: str = '5432'

    # JWT settings
    JWT_SECRET: str = 'tu_clave_secreta_muy_segura'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Server settings
    DEBUG: bool = True
    ALLOWED_ORIGINS: List[str] = ['http://localhost:5173', 'http://127.0.0.1:5173']

    # Application settings
    APP_NAME: str = 'MonitoringApp'
    APP_VERSION: str = '1.0.0'

    def update_from_env(self):
        """Actualiza la configuración desde variables de entorno"""
        if os.getenv('DB_NAME'): self.DB_NAME = os.getenv('DB_NAME')
        if os.getenv('DB_USER'): self.DB_USER = os.getenv('DB_USER')
        if os.getenv('DB_PASSWORD'): self.DB_PASSWORD = os.getenv('DB_PASSWORD')
        if os.getenv('DB_HOST'): self.DB_HOST = os.getenv('DB_HOST')
        if os.getenv('DB_PORT'): self.DB_PORT = os.getenv('DB_PORT')
        
        if os.getenv('JWT_SECRET'): self.JWT_SECRET = os.getenv('JWT_SECRET')
        if os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES'): 
            self.ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES'))
        
        if os.getenv('DEBUG'): 
            self.DEBUG = os.getenv('DEBUG').lower() == 'true'
        
        if os.getenv('ALLOWED_ORIGINS'):
            self.ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS').split(',')
        
        if os.getenv('APP_NAME'): self.APP_NAME = os.getenv('APP_NAME')
        if os.getenv('APP_VERSION'): self.APP_VERSION = os.getenv('APP_VERSION')

settings = Settings()
settings.update_from_env()