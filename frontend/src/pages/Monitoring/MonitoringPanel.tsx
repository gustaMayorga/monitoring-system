import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, Camera, Shield, AlertTriangle } from 'lucide-react';
import { MonitoringEvent, CameraEvent, AlarmEvent } from '@/types/monitoring';
import { useWebSocket } from '@/hooks/useWebSocket';

const EVENT_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200',
};

export default function MonitoringPanel() {
  const [events, setEvents] = useState<MonitoringEvent[]>([]);
  const [activeDevices, setActiveDevices] = useState<number>(0);
  const [activeAlarms, setActiveAlarms] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<MonitoringEvent | null>(null);
  
  // Conexión WebSocket para eventos en tiempo real
  const { lastMessage, sendMessage } = useWebSocket('ws://localhost:8000/ws/events');

  // Procesar nuevos eventos
  const processEvent = useCallback((event: MonitoringEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 100)); // Mantener últimos 100 eventos
    
    // Actualizar contadores
    if (event.status === 'new') {
      if (event.deviceType === 'alarm') {
        setActiveAlarms(prev => prev + 1);
      }
    }
  }, []);

  // Manejar eventos WebSocket
  useEffect(() => {
    if (lastMessage) {
      try {
        const event = JSON.parse(lastMessage.data);
        processEvent(event);
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    }
  }, [lastMessage, processEvent]);

  // Reconocer evento
  const acknowledgeEvent = async (eventId: string) => {
    try {
      await fetch(`/api/events/${eventId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setEvents(prev =>
        prev.map(event =>
          event.id === eventId
            ? { ...event, status: 'acknowledged' as EventStatus }
            : event
        )
      );
    } catch (error) {
      console.error('Error acknowledging event:', error);
    }
  };

  // Renderizar detalle de evento según tipo
  const renderEventDetail = (event: MonitoringEvent) => {
    if (event.deviceType === 'camera') {
      const cameraEvent = event as CameraEvent;
      return (
        <div className="space-y-4">
          {cameraEvent.imageUrl && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={cameraEvent.imageUrl}
                alt="Event capture"
                className="object-contain w-full h-full"
              />
              {cameraEvent.boundingBox && (
                <div
                  className="absolute border-2 border-red-500"
                  style={{
                    left: `${cameraEvent.boundingBox.x}%`,
                    top: `${cameraEvent.boundingBox.y}%`,
                    width: `${cameraEvent.boundingBox.width}%`,
                    height: `${cameraEvent.boundingBox.height}%`,
                  }}
                />
              )}
            </div>
          )}
          <div className="space-y-2">
            <h3 className="font-medium">Detalles de Detección</h3>
            <p>Tipo: {cameraEvent.detectionType}</p>
            <p>Cámara: {event.deviceName}</p>
          </div>
        </div>
      );
    } else if (event.deviceType === 'alarm') {
      const alarmEvent = event as AlarmEvent;
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Detalles de Alarma</h3>
              <p>Protocolo: {alarmEvent.protocol}</p>
              <p>Código: {alarmEvent.eventCode}</p>
              <p>Zona: {alarmEvent.zone}</p>
              <p>Usuario: {alarmEvent.user}</p>
            </div>
            {alarmEvent.rawData && (
              <div>
                <h3 className="font-medium">Datos Raw</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded">
                  {alarmEvent.rawData}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Panel principal de eventos */}
      <div className="col-span-8 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dispositivos Activos
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDevices}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertas Activas
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAlarms}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Estado del Sistema
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className="bg-green-100 text-green-800">Normal</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Eventos en Tiempo Real</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border ${EVENT_COLORS[event.priority]} cursor-pointer transition-colors hover:bg-opacity-75`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        {event.deviceType === 'camera' ? (
                          <Camera className="h-4 w-4" />
                        ) : (
                          <Bell className="h-4 w-4" />
                        )}
                        <span className="font-medium">{event.deviceName}</span>
                      </div>
                      <p className="text-sm mt-1">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant={event.status === 'new' ? 'destructive' : 'secondary'}>
                        {event.status}
                      </Badge>
                      {event.status === 'new' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            acknowledgeEvent(event.id);
                          }}
                        >
                          Reconocer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de detalle */}
      <div className="col-span-4">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Detalle del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvent ? (
              renderEventDetail(selectedEvent)
            ) : (
              <div className="text-center text-gray-500 py-8">
                Selecciona un evento para ver los detalles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}