from fastapi import WebSocket
import asyncio
from typing import Dict, List
from datetime import datetime
import json

class AlarmReceiver:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.alarm_buffer: Dict = {}
        
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))
            
    async def process_alarm(self, data: str, protocol: str):
        """Procesa las alarmas entrantes CID o SIA"""
        try:
            if protocol == "CID":
                parsed_data = self.parse_contact_id(data)
            elif protocol == "SIA":
                parsed_data = self.parse_sia(data)
            else:
                raise ValueError(f"Protocolo no soportado: {protocol}")
            
            # Enriquece los datos con información adicional
            enriched_data = await self.enrich_alarm_data(parsed_data)
            
            # Verifica con IA si hay cámaras disponibles
            if enriched_data.get("has_cameras"):
                ai_verification = await self.verify_with_ai(enriched_data)
                enriched_data["ai_verification"] = ai_verification
            
            # Notifica a todos los clientes conectados
            await self.broadcast({
                "type": "new_alarm",
                "data": enriched_data
            })
            
            return enriched_data
            
        except Exception as e:
            print(f"Error procesando alarma: {e}")
            return None 