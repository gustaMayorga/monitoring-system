import React from 'react';

interface Camera {
    id: number;
    name: string;
    location: string;
    status: 'active' | 'inactive';
}

export const CameraList: React.FC = () => {
    const cameras: Camera[] = [
        { id: 1, name: 'Cámara 1', location: 'Entrada Principal', status: 'active' },
        { id: 2, name: 'Cámara 2', location: 'Estacionamiento', status: 'active' },
        { id: 3, name: 'Cámara 3', location: 'Pasillo', status: 'inactive' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Cámaras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cameras.map(camera => (
                    <div key={camera.id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold">{camera.name}</h3>
                                <p className="text-gray-600">{camera.location}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-sm ${
                                camera.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {camera.status === 'active' ? 'Activa' : 'Inactiva'}
                            </span>
                        </div>
                        <div className="mt-4 flex space-x-2">
                            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Ver
                            </button>
                            <button className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 