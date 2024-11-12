import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Switch,
  Label,
} from '@/components/ui';

export default function TestApp() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [cameras, setCameras] = useState(mockService.getCameras());
  const [alarms, setAlarms] = useState(mockService.getAlarms());

  useEffect(() => {
    // Suscribirse a eventos
    mockService.on('cameraEvent', (event) => {
      setEvents(prev => [event, ...prev].slice(0, 50));
    });

    mockService.on('alarmEvent', (event) => {
      setEvents(prev => [event, ...prev].slice(0, 50));
    });

    return () => {
      mockService.removeAllListeners();
    };
  }, []);

  const toggleSimulation = () => {
    if (isSimulating) {
      mockService.stopSimulation();
    } else {
      mockService.startSimulation();
    }
    setIsSimulating(!isSimulating);
  };

  const triggerManualEvent = (type: 'camera' | 'alarm') => {
    if (type === 'camera') {
      const camera = cameras[Math.floor(Math.random() * cameras.length)];
      mockService.emit('cameraEvent', {
        deviceId: camera.id,
        deviceName: camera.name,
        type: 'motion',
        timestamp: new Date().toISOString(),
        confidence: 95,
        imageUrl: `/api/mock/camera/${camera.id}/snapshot?t=${Date.now()}`
      });
    } else {
      const alarm = alarms[Math.floor(Math.random() * alarms.length)];
      const zone = alarm.zones[Math.floor(Math.random() * alarm.zones.length)];
      mockService.emit('alarmEvent', {
        deviceId: alarm.id,
        deviceName: alarm.name,
        zoneId: zone.id,
        zoneName: zone.name,
        type: 'violation',
        protocol: 'CID',
        data: {
          accountNumber: '1234',
          eventCode: '1130',
          zone: zone.id,
          partition: '1'
        },
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Test de Monitoreo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Controles */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Simulación Automática</Label>
                <div className="text-sm text-muted-foreground">
                  Genera eventos aleatorios cada 5 segundos
                </div>
              </div>
              <Switch
                checked={isSimulating}
                onCheckedChange={toggleSimulation}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={() => triggerManualEvent('camera')}>
                Generar Evento de Cámara
              </Button>
              <Button onClick={() => triggerManualEvent('alarm')}>
                Generar Evento de Alarma
              </Button>
            </div>

            {/* Lista de eventos */}
            <div className="space-y-2">
              <h3 className="font-medium">Eventos Recientes</h3>
              <div className="border rounded-lg divide-y max-h-96 overflow-auto">
                {events.map((event, index) => (
                  <div key={index} className="p-2 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {event.deviceName} - {event.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.zoneName && `Zona: ${event.zoneName}`}
                      {event.confidence && `Confianza: ${event.confidence.toFixed(1)}%`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}