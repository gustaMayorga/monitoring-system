// src/components/Alarms/AlarmMonitor.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bell, AlertTriangle, Shield, ShieldCheck, ShieldOff } from 'lucide-react';

interface AlarmZone {
  id: string;
  name: string;
  status: 'armed' | 'disarmed' | 'violated' | 'bypassed';
  lastEvent?: AlarmEvent;
}

const AlarmMonitor: React.FC = () => {
  const [zones, setZones] = useState<AlarmZone[]>([]);
  const [events, setEvents] = useState<AlarmEvent[]>([]);

  useEffect(() => {
    // Escuchar eventos de alarma
    const handleAlarmEvent = (event: CustomEvent<AlarmEvent>) => {
      const alarmEvent = event.detail;
      
      // Actualizar eventos
      setEvents(prev => [alarmEvent, ...prev].slice(0, 100));
      
      // Actualizar estado de zona
      setZones(prev => prev.map(zone => 
        zone.id === alarmEvent.zone 
          ? { 
              ...zone, 
              lastEvent: alarmEvent,
              status: determineZoneStatus(alarmEvent)
            }
          : zone
      ));
    };

    window.addEventListener('alarm-event', handleAlarmEvent as EventListener);

    return () => {
      window.removeEventListener('alarm-event', handleAlarmEvent as EventListener);
    };
  }, []);

  const determineZoneStatus = (event: AlarmEvent): AlarmZone['status'] => {
    // Determinar estado basado en el código de evento
    if (event.protocol === 'CID') {
      if (event.eventCode.startsWith('3')) return 'armed';
      if (event.eventCode.startsWith('1')) return 'disarmed';
      if (event.eventCode.startsWith('1130')) return 'violated';
    }
    return 'armed';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      {/* Panel de Zonas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2" />
            Estados de Zonas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zones.map(zone => (
              <div 
                key={zone.id} 
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center">
                  {zone.status === 'armed' && <ShieldCheck className="text-green-500" />}
                  {zone.status === 'disarmed' && <ShieldOff className="text-gray-500" />}
                  {zone.status === 'violated' && <AlertTriangle className="text-red-500" />}
                  <span className="ml-2">{zone.name}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {zone.lastEvent && (
                    <span>Último evento: {zone.lastEvent.description}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Panel de Eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2" />
            Eventos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event, index) => (
              <div 
                key={index}
                className={`p-3 border rounded ${
                  event.priority === 'high' 
                    ? 'bg-red-50 border-red-200' 
                    : event.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{event.description}</span>
                  <span className="text-sm text-gray-500">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Zona: {event.zone} | Cuenta: {event.accountNumber}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {event.raw}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlarmMonitor;
