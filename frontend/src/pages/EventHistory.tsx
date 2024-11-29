import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';

interface Event {
    id: number;
    panel_id: number;
    event_type: string;
    code: string;
    description: string;
    timestamp: string;
    processed: boolean;
    priority: number;
    client_name?: string;
    panel_account?: string;
}

export default function EventHistory() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: 'all', // all, pending, processed
        priority: 'all', // all, high, medium, low
        dateRange: 'all' // all, today, week, month
    });

    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('/events/history', {
                params: filter
            });
            setEvents(response.data.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filter]);

    const getPriorityClass = (priority: number) => {
        switch (priority) {
            case 1: return 'bg-red-100 text-red-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Historial de Eventos</h2>
            
            {/* Filtros */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                    className="input"
                    value={filter.status}
                    onChange={(e) => setFilter({...filter, status: e.target.value})}
                >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="processed">Procesados</option>
                </select>
                {/* ... más filtros ... */}
            </div>

            {/* Tabla de eventos */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha/Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Código
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descripción
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map((event) => (
                            <tr key={event.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {format(new Date(event.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {event.client_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(event.priority)}`}>
                                        {event.code}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                    {event.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        event.processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {event.processed ? 'Procesado' : 'Pendiente'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 