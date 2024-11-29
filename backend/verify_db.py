def verify_database():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Verificar tablas
        tables = ['roles', 'users', 'clients']
        for table in tables:
            cur.execute(f"""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = '{table}'
                )
            """)
            exists = cur.fetchone()[0]
            print(f"Tabla {table}: {'✅' if exists else '❌'}")
        
        # Verificar roles
        cur.execute("SELECT COUNT(*) FROM roles")
        roles_count = cur.fetchone()[0]
        print(f"Roles creados: {roles_count}")
        
        # Verificar usuario admin
        cur.execute("""
            SELECT u.username, r.name as role
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.username = 'admin'
        """)
        admin = cur.fetchone()
        if admin:
            print(f"Usuario admin: ✅ (Role: {admin[1]})")
        else:
            print("Usuario admin: ❌")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cur' in locals():
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    verify_database() 