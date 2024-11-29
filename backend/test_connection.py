import psycopg2
from psycopg2.extras import DictCursor
import socket
import logging
import asyncio
import time

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_db():
    try:
        conn = psycopg2.connect(
            dbname="monitoring_db",
            user="postgres",
            password="veoveo77",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor(cursor_factory=DictCursor)
        
        logger.info("✅ Conexión a la base de datos exitosa")
        
        # Verificar tablas y datos
        cur.execute("SELECT * FROM users")
        users = cur.fetchall()
        logger.info(f"✅ Tabla users existe y tiene {len(users)} registros")
        
        cur.execute("SELECT * FROM roles")
        roles = cur.fetchall()
        logger.info(f"✅ Tabla roles existe y tiene {len(roles)} registros")
        
        cur.execute("""
            SELECT u.*, r.name as role_name 
            FROM users u 
            LEFT JOIN roles r ON u.role_id = r.id 
            WHERE u.username = 'admin'
        """)
        admin = cur.fetchone()
        if admin:
            logger.info("✅ Usuario admin encontrado:")
            logger.info(f"   ID: {admin['id']}")
            logger.info(f"   Role: {admin['role_name']}")
            logger.info(f"   Active: {admin['is_active']}")
        else:
            logger.error("❌ Usuario admin no encontrado")
        
        cur.close()
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"❌ Error en base de datos: {str(e)}")
        return False

async def test_server(host: str, port: int):
    """Prueba un servidor TCP de forma asíncrona"""
    try:
        # Crear socket IPv4 explícitamente
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.bind((host, port))
        sock.listen(1)
        logger.info(f"✅ Puerto {port} disponible")
        sock.close()
        return True
    except OSError as e:
        if e.errno == 10048:  # Puerto en uso
            logger.info(f"Puerto {port} en uso, intentando conectar como cliente")
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.connect((host, port))
                sock.close()
                logger.info(f"✅ Conexión exitosa al puerto {port}")
                return True
            except Exception as conn_e:
                logger.error(f"❌ Error conectando al puerto {port}: {str(conn_e)}")
                return False
        else:
            logger.error(f"❌ Error con el puerto {port}: {str(e)}")
            return False
    except Exception as e:
        logger.error(f"❌ Error inesperado con el puerto {port}: {str(e)}")
        return False

async def handle_echo(reader, writer):
    """Manejador simple para el servidor de prueba"""
    writer.close()

async def test_ports():
    """Prueba los puertos necesarios"""
    ports_to_test = [
        (8000, "API Server"),
        (9999, "Alarm Server")
    ]
    
    for port, name in ports_to_test:
        logger.info(f"\nProbando {name} en puerto {port}...")
        result = await test_server('localhost', port)
        if result:
            logger.info(f"✅ {name} OK")
        else:
            logger.error(f"❌ {name} NO OK")

if __name__ == "__main__":
    # Probar base de datos
    if not test_db():
        logger.error("❌ Pruebas de base de datos fallidas")
        exit(1)
    
    # Probar puertos
    asyncio.run(test_ports()) 