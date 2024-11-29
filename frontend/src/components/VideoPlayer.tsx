import React, { useEffect } from 'react';
import { useVideoStream } from '../hooks/useVideoStream';
import { CameraAdapter } from '../services/cameraAdapter';

interface Camera {
    id: number;
    name: string;
    stream_url: string;
    status: string;
    type: 'hikvision' | 'dahua';
    config: {
        ip: string;
        port: number;
        username: string;
        password: string;
    };
}

interface VideoPlayerProps {
    camera: Camera;
    ptzEnabled?: boolean;
    onError?: (error: Error) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    camera,
    ptzEnabled,
    onError
}) => {
    const { stream, loading, error, videoRef } = useVideoStream(camera.stream_url);

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error, onError]);

    const handlePTZControl = async (command: string) => {
        if (!ptzEnabled) return;

        try {
            const adapter = new CameraAdapter({
                ...camera.config,
                type: camera.type
            });

            await adapter.controlPTZ({
                command: command as any,
                speed: 5,
                channel: camera.id
            });
        } catch (err) {
            console.error('Error controlling PTZ:', err);
            onError?.(err as Error);
        }
    };

    if (loading) {
        return (
            <div data-testid="loading-spinner" className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || camera.status === 'offline') {
        return (
            <div className="flex items-center justify-center h-full bg-red-50 text-red-600">
                Error al cargar video
            </div>
        );
    }

    return (
        <div className="relative">
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted
            />
            {ptzEnabled && (
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button
                        data-testid="ptz-up"
                        onClick={() => handlePTZControl('up')}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                    >
                        ↑
                    </button>
                    <div className="flex gap-2">
                        <button
                            data-testid="ptz-left"
                            onClick={() => handlePTZControl('left')}
                            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                        >
                            ←
                        </button>
                        <button
                            data-testid="ptz-right"
                            onClick={() => handlePTZControl('right')}
                            className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                        >
                            →
                        </button>
                    </div>
                    <button
                        data-testid="ptz-down"
                        onClick={() => handlePTZControl('down')}
                        className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                    >
                        ↓
                    </button>
                </div>
            )}
        </div>
    );
}; 