import React from 'react';
import { VideoPlayer } from './VideoPlayer';
import type { Camera } from '../types/camera';

interface Layout {
    rows: number;
    cols: number;
}

interface CameraGridProps {
    cameras: Camera[];
    layout: Layout;
    onCameraSelect?: (camera: Camera) => void;
}

export const CameraGrid: React.FC<CameraGridProps> = ({ cameras, layout, onCameraSelect }) => {
    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
        gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
        gap: '1rem',
        height: '100%'
    };

    const maxCameras = layout.rows * layout.cols;
    const visibleCameras = cameras.slice(0, maxCameras);

    return (
        <div style={gridStyle}>
            {visibleCameras.map((camera) => (
                <div
                    key={camera.id}
                    data-testid="video-player"
                    className="relative"
                    onClick={() => onCameraSelect?.(camera)}
                >
                    <VideoPlayer camera={camera} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                        {camera.name}
                    </div>
                </div>
            ))}
        </div>
    );
}; 