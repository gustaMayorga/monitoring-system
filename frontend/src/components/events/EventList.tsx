import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api, { isAxiosError } from '../../utils/api';
import { Event, EventStatus } from '../../types/event';
import { EventDetails } from './EventDetails';
import { Modal } from '../common/Modal';
import { useWebSocket } from '../../hooks/useWebSocket';

export const EventList: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        fromDate: '',
        toDate: '',
        clientId: '',
        cameraId: ''
    });
    const [realTimeEvents, setRealTimeEvents] = useState<Event[]>([]);

    const handleNewEvent = useCallback((event: Event) => {
        setRealTimeEvents(prev => [event, ...prev].slice(0, 10)); // Mantener solo los 10 eventos más recientes
        
        // Si el evento es una actualización, actualizar la lista principal
        setEvents(prevEvents => 
            prevEvents.map(e => 
                e.id === event.id ? { ...e, ...event } : e
            )
        );
    }, []);

    const { subscribe } = useWebSocket({
        onEvent: handleNewEvent,
        onError: (error) => setError(error),
        autoReconnect: true
    });

    useEffect(() => {
        subscribe('all_events');
    }, [subscribe]);

    useEffect(() => {
        loadEvents();
    }, [filters]);

    const loadEvents = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.fromDate) params.append('fromDate', filters.fromDate);
            if (filters.toDate) params.append('toDate', filters.toDate);
            if (filters.clientId) params.append('clientId', filters.clientId);
            if (filters.cameraId) params.append('cameraId', filters.cameraId);

            const response = await api.get('/events', { params });
            setEvents(response.data.data);
        } catch (error) {
            if (isAxiosError(error)) {
                setError(error.response?.data?.message || 'Error al cargar los eventos');
            } else {
                setError('Error inesperado');
            }
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'error': return 'bg-orange-100 text-orange-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusClass = (status: EventStatus): string => {
        switch (status) {
            case 'resolved':
                return 'bg-green-100';
            case 'processing':
                return 'bg-yellow-100';
            case 'dismissed':
                return 'bg-gray-100';
            case 'pending':
            default:
                return 'bg-blue-100';
        }
    };

    const getStatusText = (status: EventStatus): string => {
        switch (status) {
            case 'resolved':
                return 'Resuelto';
            case 'processing':
                return 'En proceso';
            case 'dismissed':
                return 'Descartado';
            case 'pending':
            default:
                return 'Pendiente';
        }
    };

    if (loading) return <div>Cargando eventos...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Eventos</h2>
                <div className="flex space-x-2">
                    <div className="flex flex-col">
                        <label htmlFor="status" className="text-sm text-gray-600 mb-1">
                            Estado
                        </label>
                        <select
                            id="status"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="rounded-md border-gray-300"
                        >
                            <option value="">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="processing">En proceso</option>
                            <option value="processed">Procesado</option>
                            <option value="failed">Fallido</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="fromDate" className="text-sm text-gray-600 mb-1">
                            Desde
                        </label>
                        <input
                            id="fromDate"
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                            className="rounded-md border-gray-300"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="toDate" className="text-sm text-gray-600 mb-1">
                            Hasta
                        </label>
                        <input
                            id="toDate"
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                            className="rounded-md border-gray-300"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha/Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente/Cámara
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {events.map(event => (
                            <tr key={event.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {format(new Date(event.occurred_at), 'PPpp', { locale: es })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(event.event_type?.severity || 'info')}`}>
                                        {event.event_type?.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{event.client?.name}</div>
                                    <div className="text-sm text-gray-500">{event.camera?.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`p-3 rounded-lg ${getStatusClass(event.status)}`}>
                                        <span className="text-sm font-medium">
                                            {getStatusText(event.status)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => {
                                            setSelectedEvent(event);
                                            setIsDetailsOpen(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Ver detalles
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {realTimeEvents.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Eventos en tiempo real</h3>
                    <div className="space-y-2">
                        {realTimeEvents.map(event => (
                            <div
                                key={`${event.id}-${event.status}`}
                                className={`p-3 rounded-lg ${getStatusClass(event.status)}`}
                            >
                                <div className="flex justify-between">
                                    <span className="font-medium">
                                        {event.event_type?.name}
                                    </span>
                                    <span className="text-sm">
                                        {format(new Date(event.occurred_at), 'HH:mm:ss')}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    Estado: {event.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
                {selectedEvent && (
                    <EventDetails
                        event={selectedEvent}
                        onClose={() => setIsDetailsOpen(false)}
                    />
                )}
            </Modal>
        </div>
    );
}; 