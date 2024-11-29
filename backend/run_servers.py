import asyncio
import uvicorn
import multiprocessing
import sys
import os
import logging
import time
import socket

# Agregar el directorio actual al PYTHONPATH
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from alarm_server.receiver import AlarmReceiver

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_alarm_server():
    try:
        logger.info("Iniciando servidor de alarmas en puerto 9999...")
        receiver = AlarmReceiver(host='127.0.0.1', port=9999)
        logger.info("Servidor de alarmas creado, iniciando...")
        asyncio.run(receiver.start())
    except Exception as e:
        logger.error(f"Error en servidor de alarmas: {e}")
        raise

def run_api_server():
    try:
        logger.info("Iniciando servidor API en puerto 8000...")
        uvicorn.run(
            "main:app", 
            host="127.0.0.1",
            port=8000, 
            reload=True,
            access_log=False
        )
    except Exception as e:
        logger.error(f"Error en servidor API: {e}")
        sys.exit(1)

def check_port(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # IPv4 explícito
    try:
        sock.bind(('127.0.0.1', port))  # Usar IPv4
        sock.close()
        return True
    except Exception as e:
        logger.error(f"Error verificando puerto {port}: {e}")
        return False

async def wait_for_port(port: int, timeout: int = 30):
    """Espera hasta que un puerto esté disponible"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(('127.0.0.1', port))
            sock.close()
            return True
        except:
            await asyncio.sleep(1)
    return False

def check_services():
    """Verifica que los servicios necesarios estén corriendo"""
    try:
        # Verificar puerto 9999
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 9999))
        sock.close()
        if result == 0:
            logger.info("✅ Servidor de alarmas corriendo en puerto 9999")
        else:
            logger.error("❌ Servidor de alarmas no detectado en puerto 9999")

        # Verificar puerto 8000
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', 8000))
        sock.close()
        if result == 0:
            logger.info("✅ Servidor API corriendo en puerto 8000")
        else:
            logger.error("❌ Servidor API no detectado en puerto 8000")

    except Exception as e:
        logger.error(f"Error verificando servicios: {e}")

if __name__ == "__main__":
    # Verificar que los puertos estén disponibles
    if not check_port(9999):
        logger.error("Puerto 9999 no disponible. Intentando liberar...")
        import subprocess
        subprocess.run(['taskkill', '/F', '/IM', 'python.exe'])
        time.sleep(2)
        if not check_port(9999):
            logger.error("No se pudo liberar el puerto 9999")
            sys.exit(1)

    logger.info("Iniciando servicios...")
    
    # Iniciar el servidor de alarmas
    alarm_process = multiprocessing.Process(target=run_alarm_server)
    alarm_process.start()
    logger.info(f"Proceso de servidor de alarmas iniciado con PID: {alarm_process.pid}")

    # Esperar a que el servidor de alarmas esté listo
    time.sleep(5)
    check_services()
    
    if not alarm_process.is_alive():
        logger.error("El servidor de alarmas no pudo iniciarse")
        sys.exit(1)

    # Iniciar el servidor API
    try:
        run_api_server()
    except KeyboardInterrupt:
        logger.info("\nDeteniendo servidores...")
        alarm_process.terminate()
        alarm_process.join()
        sys.exit(0)
    except Exception as e:
        logger.error(f"Error inesperado: {e}")
        alarm_process.terminate()
        alarm_process.join()
        sys.exit(1) 