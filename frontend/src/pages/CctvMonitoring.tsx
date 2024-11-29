import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { VideoCameraIcon } from '@heroicons/react/solid';

interface Camera {
    id: number;
    name: string;
    stream_url: string;
    status: 'online' | 'offline';
    type: string;
}

export default function CctvMonitoring() {
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchCameras = async () => {
            try {
                const response = await axiosInstance.get('/api/cameras');
                setCameras(response.data);
                setIsLoading(false);
            } catch (err) {
                setErrorMessage('Error al cargar las cámaras');
                setIsLoading(false);
            }
        };

        fetchCameras();
    }, []);

    if (isLoading) return <div>Cargando...</div>;
    if (errorMessage) return <div>{errorMessage}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cameras.map(camera => (
                <div key={camera.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                        <VideoCameraIcon className="h-5 w-5" />
                        <h3 className="text-lg font-medium">{camera.name}</h3>
                    </div>
                    <div className="mt-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                            camera.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {camera.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
} 