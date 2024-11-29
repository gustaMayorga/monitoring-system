import React, { useState } from 'react';
import { Camera, CameraStatus } from '../../types/camera';
import { CameraStream } from './CameraStream';

interface Props {
    cameras: Camera[];
}

export const CameraGrid: React.FC<Props> = ({ cameras }) => {
    const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

    const getStatusClass = (status: CameraStatus) => {
        switch (status) {
            case 'inactive':
                return 'bg-red-100 text-red-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-green-100 text-green-800';
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cameras.map(camera => (
                <div key={camera.id} className="relative">
                    <CameraStream camera={camera} />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white font-medium">{camera.name}</h3>
                        <p className="text-white/80 text-sm">{camera.location}</p>
                    </div>
                    {camera.status !== 'active' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className={`px-2 py-1 rounded text-sm ${getStatusClass(camera.status)}`}>
                                {camera.status === 'maintenance' ? 'En mantenimiento' : 'Inactiva'}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}; 