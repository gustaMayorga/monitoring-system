import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Maximize2, 
  Minimize2, 
  Video, 
  VideoOff,
  Settings,
  AlertTriangle
} from 'lucide-react';
//import { VideoAnalyzer, DetectionResult } from '@/services/videoAnalyzer';
import { useWebSocket } from '@/hooks/useWebSocket';
// Cambia la importación de
// import { VideoAnalyzer, DetectionResult } from '@/services/videoAnalyzer';
// a
import VideoAnalyzer, { DetectionResult } from '@/services/videoAnalyzer';

interface VideoViewerProps {
  cameraId: string;
  streamUrl: string;
  cameraName: string;
  onConfigureClick?: () => void;
}

export default function VideoViewer({ 
  cameraId, 
  streamUrl, 
  cameraName,
  onConfigureClick 
}: VideoViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const analyzerRef = useRef<VideoAnalyzer | null>(null);

  // WebSocket para eventos de la cámara
  const { lastMessage } = useWebSocket(`ws://localhost:8000/ws/camera/${cameraId}`);

  useEffect(() => {
    // Inicializar el analizador de video
    analyzerRef.current = new VideoAnalyzer({
      enableMotionDetection: true,
      motionSensitivity: 50,
      enableObjectDetection: true,
      objectClasses: ['person', 'vehicle'],
      minConfidence: 0.6
    });

    // Suscribirse a eventos del analizador
    analyzerRef.current.onEvent((event) => {
      if (event.type === 'detection') {
        setDetections(prev => [...prev, event.detection].slice(-10));
      }
    });

    return () => {
      analyzerRef.current?.destroy();
    };
  }, []);

  // Procesar frames del video
  const processVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || !analyzerRef.current) return;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    // Dibujar el frame actual en el canvas
    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Obtener datos de la imagen para análisis
    const imageData = context.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Analizar el frame
    analyzerRef.current.analyzeFrame(
      imageData,
      Date.now(),
      cameraId
    ).then((newDetections) => {
      // Dibujar resultados de detección
      drawDetections(context, newDetections);
    }).catch((error) => {
      console.error('Error analyzing frame:', error);
    });

    // Continuar el loop de procesamiento
    requestAnimationFrame(processVideoFrame);
  };

  // Dibujar las detecciones en el canvas
  const drawDetections = (
    context: CanvasRenderingContext2D,
    detections: DetectionResult[]
  ) => {
    detections.forEach(detection => {
      if (!detection.boundingBox) return;

      const { x, y, width, height } = detection.boundingBox;
      const canvas = canvasRef.current!;
      
      // Convertir coordenadas relativas a absolutas
      const boxX = x * canvas.width;
      const boxY = y * canvas.height;
      const boxWidth = width * canvas.width;
      const boxHeight = height * canvas.height;

      // Estilo según tipo de detección
      context.strokeStyle = getDetectionColor(detection.type);
      context.lineWidth = 2;
      context.strokeRect(boxX, boxY, boxWidth, boxHeight);

      // Etiqueta
      context.fillStyle = getDetectionColor(detection.type);
      context.fillRect(boxX, boxY - 20, 100, 20);
      context.fillStyle = 'white';
      context.font = '12px Arial';
      context.fillText(
        `${detection.type} ${Math.round(detection.confidence * 100)}%`,
        boxX + 5,
        boxY - 5
      );
    });
  };

  // Color según tipo de detección
  const getDetectionColor = (type: string): string => {
    switch (type) {
      case 'person':
        return '#ff0000';
      case 'vehicle':
        return '#00ff00';
      case 'motion':
        return '#0000ff';
      default:
        return '#yellow';
    }
  };

  // Iniciar streaming
  const startStream = async () => {
    try {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          deviceId: cameraId
        } 
      });
      
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Configurar canvas
      if (canvasRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
      }

      setIsStreaming(true);
      setError(null);
      
      // Iniciar procesamiento de frames
      requestAnimationFrame(processVideoFrame);
    } catch (err) {
      setError('Error al iniciar el streaming');
      console.error('Error starting stream:', err);
    }
  };

  // Detener streaming
  const stopStream = () => {
    if (!videoRef.current?.srcObject) return;

    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
    setIsStreaming(false);
  };

  // Alternar pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Card className={`${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5" />
          <span>{cameraName}</span>
          {isStreaming && (
            <Badge variant="success" className="ml-2">
              En vivo
            </Badge>
          )}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onConfigureClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={isStreaming ? stopStream : startStream}
          >
            {isStreaming ? (
              <VideoOff className="h-4 w-4" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-100">
              <div className="text-red-500 flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain"
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </div>

        {/* Detecciones recientes */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Detecciones Recientes</h3>
          <div className="space-y-2">
            {detections.map((detection, index) => (
              <div
                key={index}
                className="text-sm p-2 bg-gray-50 rounded-md flex justify-between items-center"
              >
                <span>
                  {detection.type} - {Math.round(detection.confidence * 100)}%
                </span>
                <span className="text-gray-500 text-xs">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}