import React, { useState, useEffect } from 'react';
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Grid2X2, Grid3X3 } from 'lucide-react';
import VideoViewer from '@/components/VideoAnalysis/VideoViewer';
import ConfigurationPanel from '@/components/VideoAnalysis/ConfigurationPanel';

interface Camera {
  id: string;
  name: string;
  streamUrl: string;
  status: 'active' | 'inactive';
  config: any;
}

export default function CameraMonitorPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [layout, setLayout] = useState<'2x2' | '3x3'>('2x2');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCameras = async () => {
      try {
        // Conectar con tu API
        const response = await fetch('/api/cameras');
        const data = await response.json();
        setCameras(data);
      } catch (error) {
        console.error('Error loading cameras:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCameras();
  }, []);

  const handleConfigUpdate = async (cameraId: string, config: any) => {
    try {
      await fetch(`/api/cameras/${cameraId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      // Actualizar configuración local
      setCameras(prev =>
        prev.map(camera =>
          camera.id === cameraId
            ? { ...camera, config }
            : camera
        )
      );

      setShowConfig(false);
    } catch (error) {
      console.error('Error updating camera config:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando cámaras...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Controles */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Monitoreo de Cámaras</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={layout === '2x2' ? 'default' : 'outline'}
            onClick={() => setLayout('2x2')}
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === '3x3' ? 'default' : 'outline'}
            onClick={() => setLayout('3x3')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid de cámaras */}
      <div className={`grid gap-4 ${
        layout === '2x2' ? 'grid-cols-2' : 'grid-cols-3'
      }`}>
        {cameras.map((camera) => (
          <VideoViewer
            key={camera.id}
            cameraId={camera.id}
            streamUrl={camera.streamUrl}
            cameraName={camera.name}
            onConfigureClick={() => {
              setSelectedCamera(camera);
              setShowConfig(true);
            }}
          />
        ))}
      </div>

      {/* Modal de configuración */}
      <Dialog 
        open={showConfig} 
        onOpenChange={setShowConfig}
      >
        {selectedCamera && (
          <ConfigurationPanel
            cameraId={selectedCamera.id}
            currentConfig={selectedCamera.config}
            onConfigUpdate={(config) =>
              handleConfigUpdate(selectedCamera.id, config)
            }
          />
        )}
      </Dialog>
    </div>
  );
}