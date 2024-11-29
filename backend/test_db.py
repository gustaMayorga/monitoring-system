import psycopg2
from psycopg2.extras import DictCursor
import time

# Configuración PostgreSQL
DB_CONFIG = {
    'dbname': 'monitoring_db',
    'user': 'postgres',
    'password': 'veoveo77',
    'host': 'localhost',
    'port': '5432'
}

def test_db():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Verificar tabla users
        cur.execute("SELECT * FROM users")
        users = cur.fetchall()
        print(f"✅ Usuarios encontrados: {len(users)}")
        
        # Verificar tabla roles
        cur.execute("SELECT * FROM roles")
        roles = cur.fetchall()
        print(f"✅ Roles encontrados: {len(roles)}")
        
        # Verificar tabla clients
        cur.execute("SELECT * FROM clients")
        clients = cur.fetchall()
        print(f"✅ Clientes encontrados: {len(clients)}")
        
        cur.close()
        conn.close()
        print("✅ Conexión exitosa")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Ejecutando script de creación de tablas...")
        from check_database import create_tables
        create_tables()
        print("\nVolviendo a intentar la conexión...")
        test_db()

def verify_db_structure():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Verificar estructura de tablas
        tables = ['roles', 'users', 'clients']
        for table in tables:
            cur.execute(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table}'
            """)
            columns = cur.fetchall()
            print(f"\nEstructura de tabla {table}:")
            for col in columns:
                print(f"  - {col[0]}: {col[1]}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error verificando estructura: {e}")

if __name__ == "__main__":
    print("=== Verificando conexión y tablas ===")
    test_db()
    print("\n=== Verificando estructura de tablas ===")
    verify_db_structure() 