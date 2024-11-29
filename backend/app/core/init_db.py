# backend/app/core/init_db.py
from sqlalchemy.orm import Session
from ..models import Base, User
from ..core.security import get_password_hash
from .database import engine, SessionLocal

def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Crear usuario admin si no existe
    if not db.query(User).filter(User.email == "admin@example.com").first():
        user = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin"),
            full_name="Admin User",
            role="admin",
            is_active=True
        )
        db.add(user)
        db.commit()

# Script de inicialización
if __name__ == "__main__":
    init_db()