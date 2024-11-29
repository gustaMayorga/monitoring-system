from fastapi import FastAPI, WebSocket, HTTPException
from typing import List, Dict, Optional
import asyncio
import cv2
import numpy as np
from datetime import datetime
import json

class CameraManager:
    def __init__(self):
        self.cameras: Dict[str, "Camera"] = {}
        self.ai_processor = AIProcessor()
        self.storage_manager = StorageManager()
        
    async def add_camera(self, camera_config: dict):
        """Agrega una nueva cámara al sistema"""
        try:
            camera = Camera(
                id=camera_config["id"],
                url=camera_config["url"],
                ai_config=camera_config.get("ai_config", {})
            )
            self.cameras[camera.id] = camera
            await camera.connect()
            
            if camera.ai_config.get("enabled", False):
                await self.ai_processor.start_processing(camera)
                
            return {"status": "success", "message": "Camera added successfully"}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
    async def process_frame(self, camera_id: str, frame: np.ndarray):
        """Procesa un frame de video con IA"""
        try:
            camera = self.cameras.get(camera_id)
            if not camera:
                raise ValueError(f"Camera {camera_id} not found")
                
            # Detección de objetos
            if camera.ai_config.get("object_detection", False):
                detections = await self.ai_processor.detect_objects(frame)
                
            # Detección de cruce de línea
            if camera.ai_config.get("line_crossing", False):
                crossings = await self.ai_processor.detect_line_crossing(frame)
                
            # Detección facial
            if camera.ai_config.get("face_detection", False):
                faces = await self.ai_processor.detect_faces(frame)
                
            # Combinar resultados
            results = {
                "timestamp": datetime.now().isoformat(),
                "camera_id": camera_id,
                "detections": detections,
                "crossings": crossings,
                "faces": faces
            }
            
            # Almacenar eventos significativos
            if self.should_store_event(results):
                await self.storage_manager.store_event(results)
                
            return results
            
        except Exception as e:
            print(f"Error processing frame: {e}")
            return None
            
    def should_store_event(self, results: dict) -> bool:
        """Determina si un evento debe ser almacenado basado en su importancia"""
        # Implementar lógica de decisión
        return True

class Camera:
    def __init__(self, id: str, url: str, ai_config: dict):
        self.id = id
        self.url = url
        self.ai_config = ai_config
        self.stream = None
        self.is_recording = False
        
    async def connect(self):
        """Establece conexión con la cámara"""
        try:
            self.stream = cv2.VideoCapture(self.url)
            if not self.stream.isOpened():
                raise Exception(f"Could not connect to camera {self.id}")
        except Exception as e:
            raise Exception(f"Error connecting to camera {self.id}: {str(e)}")
            
    async def get_frame(self) -> Optional[np.ndarray]:
        """Obtiene un frame de la cámara"""
        if self.stream and self.stream.isOpened():
            ret, frame = self.stream.read()
            if ret:
                return frame
        return None 