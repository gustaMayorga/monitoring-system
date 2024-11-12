import React, { useState, useEffect } from 'react';
import mockService from '@/services/mockService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Switch,
  Label
} from '@/components/ui';

export default function TestApp() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [status, setStatus] = useState(mockService.getStatus());

  useEffect(() => {
    const handleEvent = (event: any) => {
      setEvents(prev => [event, ...prev].slice(0, 50));
    };

    mockService.on('event', handleEvent);

    return () => {
      mockService.off('event', handleEvent);
    };
  }, []);

  const toggleSimulation = () => {
    if (isSimulating) {
      mockService.stopSimulation();
    } else {
      mockService.startSimulation();
    }
    setIsSimulating(!isSimulating);
    setStatus(mockService.getStatus());
  };

  const generateEvent = (type: 'camera' | 'alarm') => {
    mockService.generateManualEvent(type);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Pruebas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Control de Simulación */}
            <div className="flex items-center justify-between">
              <div>
                <Label>Simulación Automática</Label>
                <p className="text-sm text-gray-500">
                  Genera eventos aleatorios cada 5 segundos
                </p>
              </div>
              <Switch
                checked={isSimulating}
                onCheckedChange={toggleSimulation}
              />
            </div>

            {/* Controles Manuales */}
            <div className="flex space-x-4">
              <Button onClick={() => generateEvent('camera')}>
                Evento de Cámara
              </Button>
              <Button onClick={() => generateEvent('alarm')}>
                Evento de Alarma
              </Button>
            </div>

            {/* Lista de Eventos */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Eventos Recientes</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {event.deviceName} - {event.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.details && (
                      <pre className="text-sm text-gray-600 mt-1">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    )}
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