// src/pages/Alarms/AlarmsPage.tsx
import { useState, useEffect } from 'react';
import { alarmService, Alarm } from '@/services/alarmService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const AlarmsPage = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlarms();
    initializeWebSocket();
  }, []);

  const loadAlarms = async () => {
    try {
      const response = await alarmService.getAlarms();
      setAlarms(response.data);
    } catch (err) {
      setError('Error al cargar las alarmas');
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/alarms');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleAlarmEvent(data);
    };

    return () => ws.close();
  };

  const handleAlarmEvent = (event: any) => {
    setAlarms(prevAlarms => 
      prevAlarms.map(alarm => 
        alarm.id === event.alarmId 
          ? { ...alarm, ...event.data }
          : alarm
      )
    );
  };

  const handleAcknowledge = async (alarmId: string) => {
    try {
      await alarmService.acknowledgeAlarm(alarmId);
      loadAlarms();
    } catch (err) {
      setError('Error al reconocer la alarma');
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  return (
    <div className="p-6">
      <div className="grid gap-4">
        {alarms.map((alarm) => (
          <Card key={alarm.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{alarm.type}</h3>
                <p className="text-sm text-gray-500">Zona: {alarm.zone}</p>
                <p className="text-sm text-gray-500">
                  Último evento: {new Date(alarm.lastEvent).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded text-sm mr-4
                  ${alarm.status === 'active' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'}`}
                >
                  {alarm.status}
                </span>
                <Button 
                  size="sm"
                  onClick={() => handleAcknowledge(alarm.id)}
                  disabled={alarm.status === 'inactive'}
                >
                  Reconocer
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AlarmsPage;