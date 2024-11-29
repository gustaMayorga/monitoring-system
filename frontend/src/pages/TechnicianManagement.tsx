import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    UserIcon,
    LocationMarkerIcon,
    ClockIcon,
    StarIcon,
    ChartBarIcon,
    CalendarIcon
} from '@heroicons/react/outline';

interface Technician {
    id: number;
    user_id: number;
    name: string;
    specialties: string[];
    rating: number;
    available: boolean;
    current_location_lat?: number;
    current_location_lon?: number;
    last_location_update?: string;
    current_load: number;
    completed_services: number;
    average_completion_time: number;
    satisfaction_rate: number;
}

interface ServiceAssignment {
    id: number;
    service_id: number;
    client_name: string;
    service_type: string;
    priority: number;
    status: string;
    scheduled_date: string;
    estimated_duration: number;
    address: string;
    location_lat?: number;
    location_lon?: number;
}

interface TechnicianStats {
    daily_completed: number;
    weekly_completed: number;
    monthly_completed: number;
    average_rating: number;
    on_time_percentage: number;
    efficiency_score: number;
}

export default function TechnicianManagement() {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
    const [assignments, setAssignments] = useState<ServiceAssignment[]>([]);
    const [stats, setStats] = useState<TechnicianStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));

    const [formData, setFormData] = useState({
        user_id: '',
        specialties: [] as string[],
        available: true
    });

    useEffect(() => {
        fetchTechnicians();
    }, []);

    useEffect(() => {
        if (selectedTechnician) {
            fetchAssignments(selectedTechnician.id);
            fetchStats(selectedTechnician.id);
        }
    }, [selectedTechnician, dateFilter]);

    const fetchTechnicians = async () => {
        try {
            const response = await axiosInstance.get('/technicians');
            if (response.data.status === 'success') {
                setTechnicians(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching technicians:', err);
            setError('Error al cargar técnicos');
        } finally {
            setLoading(false);
        }
    };

    const fetchAssignments = async (technicianId: number) => {
        try {
            const response = await axiosInstance.get(`/technicians/${technicianId}/assignments`, {
                params: { date: dateFilter }
            });
            if (response.data.status === 'success') {
                setAssignments(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
        }
    };

    const fetchStats = async (technicianId: number) => {
        try {
            const response = await axiosInstance.get(`/technicians/${technicianId}/stats`);
            if (response.data.status === 'success') {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/technicians', formData);
            if (response.data.status === 'success') {
                setShowForm(false);
                setFormData({
                    user_id: '',
                    specialties: [],
                    available: true
                });
                fetchTechnicians();
            }
        } catch (err) {
            console.error('Error creating technician:', err);
            setError('Error al crear técnico');
        }
    };

    const handleUpdateAvailability = async (technicianId: number, available: boolean) => {
        try {
            const response = await axiosInstance.patch(`/technicians/${technicianId}`, {
                available
            });
            if (response.data.status === 'success') {
                fetchTechnicians();
            }
        } catch (err) {
            console.error('Error updating availability:', err);
            setError('Error al actualizar disponibilidad');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Gestión de Técnicos
                </h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                >
                    Nuevo Técnico
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Lista de técnicos */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Técnicos
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {technicians.map((tech) => (
                            <button
                                key={tech.id}
                                onClick={() => setSelectedTechnician(tech)}
                                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                    selectedTechnician?.id === tech.id ? 'bg-gray-50 dark:bg-gray-700' : ''
                                }`}
                            >
                                <div className="flex items-center">
                                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {tech.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {tech.specialties.join(', ')}
                                        </p>
                                    </div>
                                </div>
                                <div className={`h-2.5 w-2.5 rounded-full ${
                                    tech.available ? 'bg-green-400' : 'bg-gray-400'
                                }`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detalles y estadísticas */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedTechnician ? (
                        <>
                            {/* Información general */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {selectedTechnician.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Especialidades: {selectedTechnician.specialties.join(', ')}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center">
                                            <StarIcon className="h-5 w-5 text-yellow-400" />
                                            <span className="ml-1 text-sm font-medium text-gray-900 dark:text-white">
                                                {selectedTechnician.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleUpdateAvailability(
                                                selectedTechnician.id,
                                                !selectedTechnician.available
                                            )}
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                selectedTechnician.available
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {selectedTechnician.available ? 'Disponible' : 'No disponible'}
                                        </button>
                                    </div>
                                </div>

                                {/* Estadísticas */}
                                {stats && (
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Servicios Completados
                                            </h4>
                                            <div className="mt-2 flex justify-between items-baseline">
                                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {stats.daily_completed}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Hoy
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Satisfacción
                                            </h4>
                                            <div className="mt-2 flex justify-between items-baseline">
                                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {stats.average_rating.toFixed(1)}
                                                </p>
                                                <div className="flex items-center">
                                                    <StarIcon className="h-4 w-4 text-yellow-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Eficiencia
                                            </h4>
                                            <div className="mt-2 flex justify-between items-baseline">
                                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                    {stats.efficiency_score.toFixed(0)}%
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Promedio
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Asignaciones */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Asignaciones
                                    </h3>
                                    <input
                                        type="date"
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                        className="input"
                                    />
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {assignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="p-4"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {assignment.client_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {assignment.service_type}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    assignment.priority === 1
                                                        ? 'bg-red-100 text-red-800'
                                                        : assignment.priority === 2
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    P{assignment.priority}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center">
                                                    <ClockIcon className="h-4 w-4 mr-1" />
                                                    {format(new Date(assignment.scheduled_date), 'HH:mm')}
                                                </div>
                                                <div className="flex items-center">
                                                    <LocationMarkerIcon className="h-4 w-4 mr-1" />
                                                    {assignment.address}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
                            Selecciona un técnico para ver sus detalles
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Nuevo Técnico
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Campos del formulario */}
                                <button
                                    type="submit"
                                    className="w-full btn btn-primary"
                                >
                                    Crear Técnico
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 