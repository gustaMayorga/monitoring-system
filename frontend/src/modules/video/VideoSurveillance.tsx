import React, { useState, useEffect } from 'react';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAIDetection } from '../../hooks/useAIDetection';
import { CameraListItem } from '../../components/video/CameraListItem';
import { LayoutSelector } from '../../components/video/LayoutSelector';
import { RecordingControls } from '../../components/video/RecordingControls';
import { CameraAdapter } from '../../services/cameraAdapter';

interface Camera {
  id: number;
  name: string;
  stream_url: string;
  status: 'online' | 'offline';
  type: 'hikvision' | 'dahua';
  config: {
    ip: string;
    port: number;
    username: string;
    password: string;
  };
}

export const VideoSurveillance: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [layout, setLayout] = useState({ rows: 2, cols: 2 });
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const { isConnected } = useWebRTC({
    url: selectedCamera?.stream_url || '',
    onError: console.error
  });

  const { startDetection, stopDetection } = useAIDetection({
    modelUrl: '/models/coco-ssd/model.json',
    videoRef,
    onDetection: (detections) => {
      console.log('AI Detections:', detections);
    }
  });

  useEffect(() => {
    // Cargar cámaras
    const fetchCameras = async () => {
      try {
        const response = await fetch('/api/cameras');
        const data = await response.json();
        setCameras(data);
      } catch (error) {
        console.error('Error loading cameras:', error);
      }
    };

    fetchCameras();
  }, []);

  const handleStartRecording = async () => {
    if (!selectedCamera) return;

    try {
      const adapter = new CameraAdapter({
        ...selectedCamera.config,
        type: selectedCamera.type
      });

      await adapter.startRecording(1); // Asumiendo canal 1
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleStopRecording = async () => {
    if (!selectedCamera) return;

    try {
      const adapter = new CameraAdapter({
        ...selectedCamera.config,
        type: selectedCamera.type
      });

      await adapter.stopRecording(1); // Asumiendo canal 1
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Cámaras
          </h2>
          <div className="space-y-2">
            {cameras.map((camera) => (
              <CameraListItem
                key={camera.id}
                camera={camera}
                selected={selectedCamera?.id === camera.id}
                onClick={() => setSelectedCamera(camera)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <LayoutSelector
            currentLayout={layout}
            onLayoutChange={setLayout}
          />
          <RecordingControls
            isRecording={isRecording}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onTakeSnapshot={async () => {
              if (!selectedCamera) return;
              const adapter = new CameraAdapter({
                ...selectedCamera.config,
                type: selectedCamera.type
              });
              await adapter.getSnapshot(1);
            }}
            disabled={!selectedCamera || !isConnected}
          />
        </div>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, 1fr)`
          }}
        >
          {selectedCamera && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 