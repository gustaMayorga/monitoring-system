import { useState, useEffect, useRef } from 'react';

interface UseWebRTCOptions {
  url: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export const useWebRTC = ({ url, onConnect, onDisconnect, onError }: UseWebRTCOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected') {
            setIsConnected(true);
            onConnect?.();
          } else if (pc.iceConnectionState === 'disconnected') {
            setIsConnected(false);
            onDisconnect?.();
          }
        };

        peerConnection.current = pc;
        
        const offer = await pc.createOffer({
          offerToReceiveVideo: true,
          offerToReceiveAudio: true
        });
        
        await pc.setLocalDescription(offer);
        
        // Aquí iría la lógica de señalización con el servidor
        
      } catch (err) {
        setError(err as Error);
        onError?.(err as Error);
      }
    };

    init();

    return () => {
      peerConnection.current?.close();
    };
  }, [url]);

  return { isConnected, error };
}; 