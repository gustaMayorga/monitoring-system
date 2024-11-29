import sqlite3
import bcrypt

def create_admin():
    conn = sqlite3.connect('monitoring.db')
    c = conn.cursor()
    
    # Crear la tabla si no existe
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            must_change_password BOOLEAN DEFAULT 1
        )
    ''')
    
    # Crear usuario admin
    hashed = bcrypt.hashpw('admin'.encode('utf-8'), bcrypt.gensalt())
    try:
        c.execute('''
            INSERT INTO users (username, password, must_change_password)
            VALUES (?, ?, 1)
        ''', ('admin', hashed.decode('utf-8')))
        conn.commit()
        print("Usuario admin creado exitosamente")
    except Exception as e:
        print(f"Error al crear usuario admin: {e}")
    
    # Verificar
    admin = c.execute('SELECT * FROM users WHERE username = ?', ('admin',)).fetchone()
    print(f"Usuario admin en la DB: {admin is not None}")
    
    conn.close()

if __name__ == "__main__":
    create_admin() 