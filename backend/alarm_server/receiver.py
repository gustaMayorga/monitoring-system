import asyncio
import logging
from datetime import datetime
from typing import Optional
import re
import socket
from app.config.database import get_db_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlarmReceiver:
    def __init__(self, host: str = '127.0.0.1', port: int = 9999):
        self.host = host
        self.port = port
        self.clients = {}
        logger.info(f"AlarmReceiver inicializado en {host}:{port}")

    async def start(self):
        try:
            logger.info(f"Intentando iniciar servidor en {self.host}:{self.port}")
            
            # Verificar que el puerto está disponible
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            try:
                sock.bind((self.host, self.port))
                sock.close()
            except Exception as e:
                logger.error(f"Puerto {self.port} no disponible: {e}")
                raise
                
            server = await asyncio.start_server(
                self.handle_client, 
                self.host, 
                self.port,
                family=socket.AF_INET  # Forzar IPv4
            )
            
            addr = server.sockets[0].getsockname()
            logger.info(f'Servidor de alarmas iniciado exitosamente en {addr}')
            
            async with server:
                await server.serve_forever()
                
        except Exception as e:
            logger.error(f"Error iniciando servidor de alarmas: {e}")
            raise

    async def handle_client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        addr = writer.get_extra_info('peername')
        logger.info(f"Nueva conexión desde {addr}")
        
        try:
            while True:
                data = await reader.read(1024)
                if not data:
                    break
                
                message = data.decode()
                logger.info(f"Mensaje recibido de {addr}: {message}")
                
                # Procesar el mensaje
                await self.process_message(message, addr)
                
                # Enviar ACK
                writer.write(b'\x06')
                await writer.drain()
                logger.info(f"ACK enviado a {addr}")
                
        except Exception as e:
            logger.error(f"Error procesando mensaje de {addr}: {e}")
        finally:
            try:
                writer.close()
                await writer.wait_closed()
                logger.info(f"Conexión cerrada con {addr}")
            except Exception as e:
                logger.error(f"Error cerrando conexión con {addr}: {e}")

    async def process_message(self, message: str, addr: tuple):
        """Procesa los mensajes recibidos e identifica el protocolo"""
        if self.is_sia_message(message):
            await self.process_sia_message(message, addr)
        elif self.is_cid_message(message):
            await self.process_cid_message(message, addr)
        else:
            logger.warning(f"Mensaje no reconocido: {message}")

    def is_sia_message(self, message: str) -> bool:
        """Verifica si el mensaje es formato SIA"""
        # Implementar verificación de formato SIA
        sia_pattern = r'^\["([^"]+)"\]([^|]+)\|(.+)$'
        return bool(re.match(sia_pattern, message))

    def is_cid_message(self, message: str) -> bool:
        """Verifica si el mensaje es formato Contact ID"""
        # Implementar verificación de formato CID
        cid_pattern = r'^\d{4}18([^$]+)\$'
        return bool(re.match(cid_pattern, message))

    async def process_sia_message(self, message: str, addr: tuple):
        """Procesa mensajes en formato SIA"""
        try:
            # Extraer información del mensaje SIA
            match = re.match(r'^\["([^"]+)"\]([^|]+)\|(.+)$', message)
            if match:
                account, timestamp, data = match.groups()
                
                # Guardar en la base de datos
                conn = get_db_connection()
                cur = conn.cursor()
                
                try:
                    # Obtener panel_id
                    cur.execute("""
                        SELECT id FROM alarm_panels 
                        WHERE account_number = %s
                    """, (account,))
                    panel = cur.fetchone()
                    
                    if not panel:
                        logger.warning(f"Panel no registrado: {account}")
                        return
                    
                    # Insertar evento
                    cur.execute("""
                        INSERT INTO events (
                            panel_id, event_type, raw_message, 
                            code, qualifier, event_code, 
                            partition, zone_user, timestamp
                        ) VALUES (%s, 'SIA', %s, %s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (
                        panel[0], message, data[:2],
                        data[0], data[1:], None,
                        None, datetime.now()
                    ))
                    
                    conn.commit()
                    
                finally:
                    cur.close()
                    conn.close()
                
        except Exception as e:
            logger.error(f"Error procesando mensaje SIA: {e}")

    async def process_cid_message(self, message: str, addr: tuple):
        """Procesa mensajes en formato Contact ID"""
        # Implementar procesamiento similar al SIA
        pass

# Para iniciar el servidor
if __name__ == "__main__":
    receiver = AlarmReceiver()
    asyncio.run(receiver.start()) 