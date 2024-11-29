import numpy as np
from typing import Dict, List, Optional
from datetime import datetime
import json
import hashlib
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

class AIEngine:
    def __init__(self):
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.cache = {}
        
    async def get_embedding(self, text: str) -> np.ndarray:
        """Obtiene el embedding de un texto, usando caché si está disponible"""
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        
        if text_hash in self.cache:
            return self.cache[text_hash]
            
        embedding = self.embedding_model.encode([text])[0]
        self.cache[text_hash] = embedding
        return embedding
        
    async def find_similar_cases(
        self, 
        description: str, 
        case_history: List[Dict],
        top_k: int = 5
    ) -> List[Dict]:
        """Encuentra casos similares basados en la descripción"""
        query_embedding = await self.get_embedding(description)
        
        similarities = []
        for case in case_history:
            case_embedding = await self.get_embedding(case['description'])
            similarity = cosine_similarity(
                [query_embedding], 
                [case_embedding]
            )[0][0]
            similarities.append((similarity, case))
            
        # Ordenar por similitud y obtener los top_k
        similarities.sort(reverse=True, key=lambda x: x[0])
        return [
            {**case, 'similarity_score': float(score)} 
            for score, case in similarities[:top_k]
        ]
        
    async def predict_resolution_time(
        self, 
        service_data: Dict
    ) -> Dict[str, float]:
        """Predice el tiempo de resolución basado en datos históricos"""
        # Aquí iría la lógica del modelo de predicción
        # Por ahora retornamos un ejemplo
        return {
            'estimated_minutes': 120.0,
            'confidence': 0.85
        }
        
    async def suggest_technician(
        self, 
        service_data: Dict,
        available_technicians: List[Dict]
    ) -> Dict:
        """Sugiere el mejor técnico para un servicio"""
        # Aquí iría la lógica de recomendación
        # Por ahora retornamos un ejemplo
        return {
            'technician_id': available_technicians[0]['id'],
            'confidence': 0.9,
            'reasons': [
                'Experiencia previa con este tipo de servicio',
                'Ubicación cercana',
                'Carga de trabajo actual baja'
            ]
        }
        
    async def analyze_service_priority(
        self, 
        service_data: Dict
    ) -> Dict:
        """Analiza y sugiere la prioridad de un servicio"""
        # Aquí iría la lógica de análisis
        return {
            'suggested_priority': 2,
            'confidence': 0.8,
            'factors': [
                'Tipo de cliente',
                'Historial de servicios',
                'Impacto del problema'
            ]
        }
        
    async def optimize_route(
        self, 
        services: List[Dict],
        start_location: Dict,
        constraints: Dict
    ) -> Dict:
        """Optimiza la ruta para múltiples servicios"""
        # Aquí iría el algoritmo de optimización
        return {
            'optimized_route': [],
            'total_distance': 0.0,
            'total_time': 0,
            'confidence': 0.95
        } 