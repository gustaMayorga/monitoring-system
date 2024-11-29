import React, { useState, useEffect } from 'react';
import PageContainer from '../components/Layout/PageContainer';

interface Device {
    id: number;
    name: string;
    type: string;
    status: string;
    client_id: number;
}

const API_URL = 'http://127.0.0.1:8000';

export default function Devices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        status: 'active',
        client_id: 0
    });

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await fetch(`${API_URL}/devices`);
            const data = await response.json();
            
            if (data.status === 'success') {
                setDevices(data.data);
            } else {
                setError(data.detail || 'Error al cargar los dispositivos');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error al cargar los dispositivos');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageContainer title="Devices">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer 
            title="Devices" 
            subtitle="Monitor and manage your connected devices"
        >
            {/* Header Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search devices..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-2.5">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Add New Device
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Devices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map(device => (
                    <div key={device.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="p-5">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-900">{device.name}</h3>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    device.status === 'active' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {device.status}
                                </span>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">{device.type}</p>
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button className="text-indigo-600 hover:text-indigo-900">
                                    Edit
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        {/* ... contenido del formulario ... */}
                    </div>
                </div>
            )}
        </PageContainer>
    );
} 