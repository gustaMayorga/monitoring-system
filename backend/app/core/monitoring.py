from datetime import datetime
from typing import Dict, List

class MonitoringSystem:
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {}
        self.alerts = []

    def record_metric(self, metric_name: str, value: float) -> None:
        """Registra una nueva métrica en el sistema"""
        if metric_name not in self.metrics:
            self.metrics[metric_name] = []
        self.metrics[metric_name].append(value)
        self._check_alerts(metric_name, value)

    def get_metrics(self, metric_name: str) -> List[float]:
        """Obtiene el historial de una métrica específica"""
        return self.metrics.get(metric_name, [])

    def _check_alerts(self, metric_name: str, value: float) -> None:
        """Verifica si se debe generar una alerta basada en el valor de la métrica"""
        # Implementa tu lógica de alertas aquí
        pass 