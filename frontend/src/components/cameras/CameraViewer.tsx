// src/components/Cameras/CameraViewer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { camerasService } from '@/services/cameras.service';
import { wsService } from '@/services/websocket';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, Camera, Settings, Maximize2, Video, VideoOff } from 'lucide-react';

interface CameraEvent {
  id: string;
  cameraId: string;
  type: 'motion' | 'object_detected' | 'connection_lost';
  details: any;
  timestamp: string;
}

interface CameraProps {
  cameraId: string;
  name: string;
  streamUrl: string;
  onEvent?: (event: CameraEvent) => void;
}

const CameraViewer: React.FC<CameraProps> = ({ cameraId, name, streamUrl, onEvent }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastEvent, setLastEvent] = useState<CameraEvent | null>(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const initializeStream = async () => {
      try {
        if (videoRef.current) {
          const stream = await camerasService.getStreamUrl(cameraId);
          videoRef.current.srcObject = stream;
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error initializing camera stream:', error);
        setIsConnected(false);
      }
    };

    initializeStream();

    // Suscribirse a eventos de la cámara
    wsService.on('cameraEvent', handleCameraEvent);

    return () => {
      wsService.off('cameraEvent', handleCameraEvent);
    };
  }, [cameraId]);

  const handleCameraEvent = (event: CameraEvent) => {
    if (event.cameraId === cameraId) {
      setLastEvent(event);
      onEvent?.(event);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleRecording = async () => {
    try {
      if (!recording) {
        await camerasService.startRecording(cameraId);
        setRecording(true);
      } else {
        await camerasService.stopRecording(cameraId);
        setRecording(false);
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Camera className="w-4 h-4 mr-2" />
            <CardTitle className="text-sm">{name}</CardTitle>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={toggleRecording}
              className={`p-1 rounded hover:bg-gray-100 ${
                recording ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {recording ? <Video /> : <VideoOff />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-gray-100"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <video
          ref={videoRef}
          className="w-full h-[240px] object-cover"
          autoPlay
          muted
          playsInline
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="text-white text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>Sin conexión</p>
            </div>
          </div>
        )}
        {lastEvent && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs">
            {lastEvent.type === 'motion' && 'Movimiento detectado'}
            {lastEvent.type === 'object_detected' && `Objeto detectado: ${lastEvent.details.object}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

