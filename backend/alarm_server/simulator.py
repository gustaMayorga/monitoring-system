import asyncio
import random
from datetime import datetime
import logging
import time
import socket

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class AlarmSimulator:
    def __init__(self, host: str = '127.0.0.1', port: int = 9999):
        self.host = host
        self.port = port
        self.account = "1234"
        self.running = False
        self.max_retries = 5
        self.retry_delay = 2
        self.sia_events = [
            "BA|1", # Alarma de robo zona 1
            "FA|2", # Alarma de fuego zona 2
            "PA|3", # Pánico zona 3
            "AT|0", # Fallo AC
            "YT|0", # Batería baja
        ]

    async def test_connection(self):
        """Prueba la conexión TCP básica"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((self.host, self.port))
            logger.info("Prueba de conexión TCP exitosa")
            sock.close()
            return True
        except Exception as e:
            logger.error(f"Error en prueba de conexión TCP: {e}")
            return False

    async def connect(self):
        retries = 0
        
        # Primero probar conexión TCP básica
        if not await self.test_connection():
            logger.error("La prueba de conexión TCP falló")
            return False
            
        while retries < self.max_retries:
            try:
                logger.info(f"Intentando conectar a {self.host}:{self.port}")
                self.reader, self.writer = await asyncio.open_connection(
                    self.host, self.port
                )
                logger.info(f"Conectado exitosamente al servidor {self.host}:{self.port}")
                return True
            except Exception as e:
                retries += 1
                logger.warning(f"Intento {retries}/{self.max_retries} fallido: {str(e)}")
                if retries < self.max_retries:
                    logger.info(f"Reintentando en {self.retry_delay} segundos...")
                    await asyncio.sleep(self.retry_delay)
                else:
                    logger.error(f"Error conectando al servidor después de {self.max_retries} intentos")
                    return False

    async def send_event(self, event: str):
        """Envía un evento al servidor"""
        try:
            # Formato SIA: ["CUENTA"]TIMESTAMP|EVENTO
            timestamp = datetime.now().strftime("%H%M%S,%m%d%y")
            message = f'["{self.account}"]{timestamp}|{event}\n'
            
            self.writer.write(message.encode())
            await self.writer.drain()
            
            # Esperar ACK
            ack = await self.reader.read(1)
            if ack == b'\x06':
                logger.info(f"Evento enviado y confirmado: {event}")
            else:
                logger.warning(f"No se recibió ACK para: {event}")
                
        except Exception as e:
            logger.error(f"Error enviando evento: {e}")
            self.running = False

    async def run(self):
        """Ejecuta el simulador"""
        if not await self.connect():
            return
        
        self.running = True
        try:
            while self.running:
                # Enviar un evento aleatorio cada 30-60 segundos
                event = random.choice(self.sia_events)
                await self.send_event(event)
                await asyncio.sleep(random.randint(30, 60))
                
        except KeyboardInterrupt:
            logger.info("Simulador detenido por el usuario")
        finally:
            self.writer.close()
            await self.writer.wait_closed()
            logger.info("Conexión cerrada")

# Para ejecutar el simulador
if __name__ == "__main__":
    simulator = AlarmSimulator()
    try:
        asyncio.run(simulator.run())
    except KeyboardInterrupt:
        logger.info("Simulador detenido por el usuario")
    except Exception as e:
        logger.error(f"Error en el simulador: {e}") 