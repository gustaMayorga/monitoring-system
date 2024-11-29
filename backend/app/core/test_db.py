# backend/app/core/test_db.py
from sqlalchemy import text
from .database import engine

def test_database_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("¡Conexión exitosa!")
            return True
    except Exception as e:
        print(f"Error de conexión: {str(e)}")
        return False

if __name__ == "__main__":
    test_database_connection()