import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapIcon, ClockIcon, UserIcon } from '@heroicons/react/outline';

interface Service {
    id: number;
    client_id: number;
    client_name: string;
    service_type: string;
    priority: number;
    status: string;
    description: string;
    scheduled_date: string;
    estimated_duration: number;
    technician_name?: string;
    location_lat?: number;
    location_lon?: number;
    address: string;
}

interface Technician {
    id: number;
    name: string;
    specialties: string[];
    available: boolean;
    current_load: number;
}

export default function TechnicalServices() {
    const [services, setServices] = useState<Service[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [aiSuggestions, setAiSuggestions] = useState<any>(null);

    const [formData, setFormData] = useState({
        client_id: '',
        service_type: '',
        priority: '2',
        description: '',
        scheduled_date: '',
        estimated_duration: '',
        address: ''
    });

    useEffect(() => {
        fetchServices();
        fetchTechnicians();
        const interval = setInterval(fetchServices, 30000); // Actualizar cada 30 segundos
        return () => clearInterval(interval);
    }, [filterStatus]);

    const fetchServices = async () => {
        try {
            const response = await axiosInstance.get('/technical-services', {
                params: { status: filterStatus !== 'all' ? filterStatus : undefined }
            });
            if (response.data.status === 'success') {
                setServices(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Error al cargar servicios');
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await axiosInstance.get('/technicians', {
                params: { available_only: true }
            });
            if (response.data.status === 'success') {
                setTechnicians(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching technicians:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/technical-services', formData);
            if (response.data.status === 'success') {
                setShowForm(false);
                setFormData({
                    client_id: '',
                    service_type: '',
                    priority: '2',
                    description: '',
                    scheduled_date: '',
                    estimated_duration: '',
                    address: ''
                });
                fetchServices();
            }
        } catch (err) {
            console.error('Error creating service:', err);
            setError('Error al crear servicio');
        }
    };

    const handleAssignTechnician = async (serviceId: number, technicianId: number) => {
        try {
            const response = await axiosInstance.post(`/technical-services/${serviceId}/assign`, {
                technician_id: technicianId
            });
            if (response.data.status === 'success') {
                fetchServices();
            }
        } catch (err) {
            console.error('Error assigning technician:', err);
            setError('Error al asignar técnico');
        }
    };

    const getAISuggestions = async (serviceId: number) => {
        try {
            const response = await axiosInstance.post(`/technical-services/${serviceId}/ai-analysis`, {
                analysis_type: 'technician_recommendation'
            });
            if (response.data.status === 'success') {
                setAiSuggestions(response.data.data);
            }
        } catch (err) {
            console.error('Error getting AI suggestions:', err);
        }
    };

    const getPriorityClass = (priority: number) => {
        switch (priority) {
            case 1: return 'bg-red-100 text-red-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 3: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Servicios Técnicos
                </h2>
                <div className="flex space-x-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completados</option>
                    </select>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                    >
                        Nuevo Servicio
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {service.client_name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {service.service_type}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(service.priority)}`}>
                                        P{service.priority}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(service.status)}`}>
                                        {service.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {service.description}
                                </p>
                                
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {format(new Date(service.scheduled_date), 'PPp', { locale: es })}
                                    <span className="mx-2">•</span>
                                    {service.estimated_duration} min
                                </div>

                                {service.address && (
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <MapIcon className="h-4 w-4 mr-1" />
                                        {service.address}
                                    </div>
                                )}

                                {service.technician_name && (
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <UserIcon className="h-4 w-4 mr-1" />
                                        {service.technician_name}
                                    </div>
                                )}
                            </div>

                            {service.status === 'pending' && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => getAISuggestions(service.id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        Obtener sugerencias de IA
                                    </button>
                                    
                                    {aiSuggestions && selectedService?.id === service.id && (
                                        <div className="mt-2 p-3 bg-indigo-50 rounded-md">
                                            <h4 className="text-sm font-medium text-indigo-900">
                                                Técnicos Recomendados
                                            </h4>
                                            <div className="mt-2 space-y-2">
                                                {aiSuggestions.recommended_technicians.map((rec: any) => (
                                                    <div
                                                        key={rec.id}
                                                        className="flex justify-between items-center"
                                                    >
                                                        <span className="text-sm text-indigo-700">
                                                            {technicians.find(t => t.id === rec.id)?.name}
                                                        </span>
                                                        <button
                                                            onClick={() => handleAssignTechnician(service.id, rec.id)}
                                                            className="text-xs text-indigo-600 hover:text-indigo-500"
                                                        >
                                                            Asignar
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de nuevo servicio */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Nuevo Servicio Técnico
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Campos del formulario */}
                                <button
                                    type="submit"
                                    className="w-full btn btn-primary"
                                >
                                    Crear Servicio
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 