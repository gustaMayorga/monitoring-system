import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '../../types/camera';

interface CameraStreamProps {
    camera: Camera;
    className?: string;
}

interface MediaStreamTrack {
    stop: () => void;
}

interface MediaStream {
    getTracks: () => MediaStreamTrack[];
}

export const CameraStream: React.FC<CameraStreamProps> = ({ camera, className = '' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startStream = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Simulación de conexión al servidor de streaming
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (videoRef.current) {
                    // En producción, aquí conectaríamos con el servidor de streaming real
                    videoRef.current.poster = `https://picsum.photos/seed/${camera.id}/800/450`;
                    
                    // Simulamos un stream
                    const fakeStream = new MediaStream();
                    streamRef.current = fakeStream;
                    videoRef.current.srcObject = fakeStream;
                }

                setIsLoading(false);
            } catch (err) {
                console.error('Error al iniciar el stream:', err);
                setError('Error al conectar con la cámara');
                setIsLoading(false);
            }
        };

        startStream();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                streamRef.current = null;
            }
        };
    }, [camera.id, camera.stream_url]);

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <div className="text-center">
                    <p className="text-red-600 mb-2">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
            />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
            )}
        </div>
    );
}; 