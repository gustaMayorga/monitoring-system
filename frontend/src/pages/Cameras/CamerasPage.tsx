import React, { useEffect, useState } from 'react';
import { Camera as CameraIcon, AlertTriangle, Check } from 'lucide-react';
import cameraService, { Camera, CameraEvent } from '../../services/cameraService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function CamerasPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCameras = async () => {
      try {
        const data = await cameraService.getCameras();
        setCameras(data);
        if (data.length > 0 && !selectedCamera) {
          setSelectedCamera(data[0]);
        }
      } catch (err) {
        setError('Error al cargar las cámaras');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCameras();
  }, []);

  useEffect(() => {
    if (!selectedCamera) return;

    const loadEvents = async () => {
      try {
        const data = await cameraService.getCameraEvents(selectedCamera.id, { limit: 10 });
        setEvents(data);
      } catch (err) {
        console.error('Error loading camera events:', err);
      }
    };

    loadEvents();

    // Suscribirse a eventos en tiempo real
    const cleanup = cameraService.subscribeToCamera(selectedCamera.id, (event) => {
      setEvents(prev => [event, ...prev.slice(0, 9)]);
    });

    return cleanup;
  }, [selectedCamera]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando cámaras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de cámaras */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Cámaras</h2>
          {cameras.map(camera => (
            <Card 
              key={camera.id}
              className={`cursor-pointer transition-shadow hover:shadow-lg ${
                selectedCamera?.id === camera.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCamera(camera)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CameraIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{camera.name}</p>
                    <p className="text-sm text-gray-500">{camera.location}</p>
                  </div>
                </div>
                {camera.status === 'active' ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Vista de cámara seleccionada */}
        <div className="lg:col-span-2">
          {selectedCamera ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedCamera.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <img
                      src={cameraService.getStreamUrl(selectedCamera.id)}
                      alt={`Stream de ${selectedCamera.name}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Eventos de la cámara */}
              <Card>
                <CardHeader>
                  <CardTitle>Eventos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className="p-3 rounded-lg border border-gray-200 flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{event.event_type}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {event.event_type === 'motion' && (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                            Movimiento detectado
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <p className="text-gray-500">Selecciona una cámara</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}