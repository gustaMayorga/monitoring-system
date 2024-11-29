import psycopg2
from psycopg2.extras import DictCursor
import bcrypt
from app.core.database import get_db_connection
import json

# Configuración PostgreSQL
DB_CONFIG = {
    'dbname': 'monitoring_db',
    'user': 'postgres',
    'password': 'veoveo77',
    'host': 'localhost',
    'port': '5432'
}

def check_and_create_admin():
    print("Verificando base de datos PostgreSQL...")
    
    conn = None
    cur = None
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Primero, eliminar la tabla si existe (solo durante desarrollo)
        cur.execute("DROP TABLE IF EXISTS users")
        
        # Crear tabla con la estructura correcta
        cur.execute('''
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                must_change_password BOOLEAN DEFAULT TRUE
            )
        ''')
        
        conn.commit()
        print("Tabla users creada exitosamente")
        
        # Verificar si existe el usuario admin
        cur.execute("SELECT * FROM users WHERE username = 'admin'")
        admin = cur.fetchone()
        
        if not admin:
            print("Usuario admin no encontrado. Creando...")
            hashed = bcrypt.hashpw('admin'.encode('utf-8'), bcrypt.gensalt())
            cur.execute('''
                INSERT INTO users (username, password, is_active, must_change_password)
                VALUES (%s, %s, TRUE, TRUE)
            ''', ('admin', hashed.decode('utf-8')))
            conn.commit()
            print("Usuario admin creado exitosamente")
        
    except Exception as e:
        print(f"Error: {e}")
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def test_connection():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT 1')
        print("Conexión exitosa a la base de datos")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error de conexión: {e}")

def create_tables():
    print("Creando tablas...")
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        print("Eliminando tablas existentes...")
        cur.execute("""
            DROP TABLE IF EXISTS alerts CASCADE;
            DROP TABLE IF EXISTS events CASCADE;
            DROP TABLE IF EXISTS devices CASCADE;
            DROP TABLE IF EXISTS clients CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS roles CASCADE;
        """)
        
        # 1. Crear tabla roles
        print("\nCreando tabla roles...")
        cur.execute("""
            CREATE TABLE roles (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                permissions JSONB DEFAULT '[]',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 2. Crear tabla users
        print("Creando tabla users...")
        cur.execute("""
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role_id INTEGER REFERENCES roles(id),
                is_active BOOLEAN DEFAULT TRUE,
                must_change_password BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 3. Crear tabla clients
        print("Creando tabla clients...")
        cur.execute("""
            CREATE TABLE clients (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                company VARCHAR(100) NOT NULL,
                tax_id VARCHAR(20) NOT NULL UNIQUE,
                phone VARCHAR(20),
                address TEXT,
                client_number VARCHAR(20) UNIQUE NOT NULL,
                registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                billing_type VARCHAR(1) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Insertar roles básicos
        print("\nInsertando roles predefinidos...")
        roles = [
            ('admin', 'Administrador del sistema', ['all']),
            ('contable', 'Usuario contable', ['read_reports', 'create_reports']),
            ('operador', 'Operador del sistema', ['read_devices', 'operate_devices']),
            ('administrativo', 'Personal administrativo', ['read_clients', 'manage_clients']),
            ('tecnico', 'Técnico de mantenimiento', ['read_devices', 'maintain_devices'])
        ]
        
        for role in roles:
            cur.execute("""
                INSERT INTO roles (name, description, permissions)
                VALUES (%s, %s, %s)
            """, (role[0], role[1], json.dumps(role[2])))
        
        # Crear usuario admin
        print("Creando usuario admin...")
        cur.execute("SELECT id FROM roles WHERE name = 'admin'")
        admin_role = cur.fetchone()
        if admin_role:
            hashed = bcrypt.hashpw('admin'.encode('utf-8'), bcrypt.gensalt())
            cur.execute("""
                INSERT INTO users (username, password, role_id, is_active, must_change_password)
                VALUES ('admin', %s, %s, TRUE, TRUE)
            """, (hashed.decode('utf-8'), admin_role[0]))
        
        conn.commit()
        print("\n✅ Todas las tablas creadas exitosamente")
        
    except Exception as e:
        print(f"\n❌ Error creando tablas: {e}")
        if conn:
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

def verify_tables():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Verificar tabla users
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'users'
            )
        """)
        users_exists = cur.fetchone()[0]
        print(f"Tabla users existe: {users_exists}")

        # Verificar tabla clientes
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'clientes'
            )
        """)
        clientes_exists = cur.fetchone()[0]
        print(f"Tabla clientes existe: {clientes_exists}")

        # Contar registros
        if clientes_exists:
            cur.execute("SELECT COUNT(*) FROM clientes")
            clientes_count = cur.fetchone()[0]
            print(f"Número de clientes: {clientes_count}")
        
        if users_exists:
            cur.execute("SELECT COUNT(*) FROM users")
            users_count = cur.fetchone()[0]
            print(f"Número de usuarios: {users_count}")
        
    except Exception as e:
        print(f"Error verificando tablas: {e}")
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

def verify_and_reset_admin():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        # Eliminar usuario admin existente
        cur.execute("DELETE FROM users WHERE username = 'admin'")
        
        # Crear nuevo usuario admin
        hashed = bcrypt.hashpw('admin'.encode('utf-8'), bcrypt.gensalt())
        cur.execute('''
            INSERT INTO users (username, password, is_active, must_change_password)
            VALUES (%s, %s, TRUE, TRUE)
        ''', ('admin', hashed.decode('utf-8')))
        
        conn.commit()
        print("Usuario admin recreado exitosamente")
        
        # Verificar el usuario
        cur.execute("SELECT * FROM users WHERE username = 'admin'")
        admin = cur.fetchone()
        print("\nDatos del usuario admin:")
        print(f"ID: {admin['id']}")
        print(f"Username: {admin['username']}")
        print(f"Is Active: {admin['is_active']}")
        print(f"Must Change Password: {admin['must_change_password']}")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

def test_db_connection():
    try:
        conn = psycopg2.connect(
            dbname="monitoring_db",
            user="postgres",  # Cambiado a postgres
            password="veoveo77",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor()
        cur.execute('SELECT version()')
        version = cur.fetchone()
        print(f"Conexión exitosa. PostgreSQL version: {version[0]}")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error conectando a PostgreSQL: {e}")

def verify_admin():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=DictCursor)
        
        cur.execute("SELECT * FROM users WHERE username = 'admin'")
        admin = cur.fetchone()
        
        if admin:
            print("\nDatos del usuario admin:")
            print(f"ID: {admin['id']}")
            print(f"Username: {admin['username']}")
            print(f"Is Active: {admin['is_active']}")
            print(f"Must Change Password: {admin['must_change_password']}")
            print(f"Password hash: {admin['password']}")
        else:
            print("Usuario admin no encontrado")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    create_tables()