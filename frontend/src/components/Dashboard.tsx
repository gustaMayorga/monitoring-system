import React from 'react';

export const Dashboard: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Cámaras Activas</h3>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Eventos Hoy</h3>
                    <p className="text-3xl font-bold text-green-600">24</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Alertas</h3>
                    <p className="text-3xl font-bold text-red-600">3</p>
                </div>
            </div>
        </div>
    );
}; 