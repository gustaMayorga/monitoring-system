// src/pages/Cameras/CamerasPage.tsx
import { useState, useEffect } from 'react';
import { cameraService, Camera } from '@/services/cameraService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

const CamerasPage = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  useEffect(() => {
    loadCameras();
    initializeWebSocket();
  }, []);

  const loadCameras = async () => {
    try {
      const response = await cameraService.getCameras();
      setCameras(response.data);
    } catch (err) {
      setError('Error al cargar las cámaras');
    } finally {
      setLoading(false);
    }
  };

  const initializeWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/cameras');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleCameraEvent(data);
    };

    return () => ws.close();
  };

  const handleCameraEvent = (event: any) => {
    // Actualizar estado de cámaras según eventos
    setCameras(prevCameras => 
      prevCameras.map(camera => 
        camera.id === event.cameraId 
          ? { ...camera, ...event.data }
          : camera
      )
    );
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <Alert variant="destructive">{error}</Alert>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map((camera) => (
          <Card key={camera.id} className="p-4">
            <div className="relative aspect-video bg-gray-100 mb-4">
              {/* Streaming de video */}
              <img 
                src={camera.streamUrl} 
                alt={camera.name}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs
                ${camera.status === 'online' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'}`}
              >
                {camera.status}
              </div>
            </div>
            <h3 className="font-medium">{camera.name}</h3>
            <p className="text-sm text-gray-500">{camera.location}</p>
            <div className="mt-4 flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => setSelectedCamera(camera)}
              >
                Ver Detalles
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => cameraService.startRecording(camera.id)}
              >
                Grabar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de detalles */}
      {selectedCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">{selectedCamera.name}</h2>
            {/* Detalles de la cámara */}
            <Button 
              onClick={() => setSelectedCamera(null)}
              className="mt-4"
            >
              Cerrar
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CamerasPage;