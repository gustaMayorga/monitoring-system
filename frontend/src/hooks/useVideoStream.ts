import { useState, useEffect, useRef } from 'react';

interface UseVideoStreamResult {
  stream: MediaStream | null;
  loading: boolean;
  error: Error | null;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const useVideoStream = (streamUrl: string): UseVideoStreamResult => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initStream = async () => {
      try {
        if (streamUrl.startsWith('rtsp://')) {
          // Usar WebRTC para RTSP
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });
          
          const mediaStream = new MediaStream();
          
          pc.ontrack = (event) => {
            mediaStream.addTrack(event.track);
          };

          // Configurar la conexión RTSP
          await pc.setLocalDescription(await pc.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true
          }));

          setStream(mediaStream);
        } else {
          // Para streams HTTP(S)
          if (videoRef.current) {
            videoRef.current.src = streamUrl;
            await videoRef.current.play();
            // Usar la API experimental de captura de medios
            const mediaStream = (videoRef.current as any).captureStream?.() ||
                              (videoRef.current as any).mozCaptureStream?.() ||
                              null;
            setStream(mediaStream);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    initStream();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [streamUrl]);

  return { stream, loading, error, videoRef };
}; 