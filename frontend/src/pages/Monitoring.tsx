import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface Event {
    id: number;
    panel_id: number;
    event_type: 'SIA' | 'CID';
    raw_message: string;
    code: string;
    qualifier: string;
    event_code: string;
    partition: string;
    zone_user: string;
    timestamp: string;
    processed: boolean;
    processed_by: number | null;
    processed_at: string | null;
    priority: 1 | 2 | 3;
    client_info?: {
        name: string;
        company: string;
        verification_code: string;
        address: string;
        phone: string;
    };
}

export default function Monitoring() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchEvents();
        // Configurar polling cada 5 segundos
        const interval = setInterval(fetchEvents, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('/events/pending');
            if (response.data.status === 'success') {
                setEvents(response.data.data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleEventClick = async (event: Event) => {
        try {
            // Obtener información detallada del evento
            const response = await axiosInstance.get(`/events/${event.id}/details`);
            if (response.data.status === 'success') {
                setSelectedEvent({
                    ...event,
                    ...response.data.data
                });
                setShowEventModal(true);
            }
        } catch (error) {
            console.error('Error fetching event details:', error);
        }
    };

    const handleProcessEvent = async (action: string) => {
        if (!selectedEvent) return;

        try {
            const response = await axiosInstance.post(`/events/${selectedEvent.id}/process`, {
                action,
                notes,
                operator_id: user?.id
            });

            if (response.data.status === 'success') {
                setShowEventModal(false);
                setSelectedEvent(null);
                setNotes('');
                fetchEvents();
            }
        } catch (error) {
            console.error('Error processing event:', error);
        }
    };

    const getPriorityColor = (priority: number) => {
        switch (priority) {
            case 1: return 'bg-red-100 text-red-800';
            case 2: return 'bg-yellow-100 text-yellow-800';
            case 3: return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Monitor de Eventos</h2>
            
            {/* Lista de eventos */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {events.map(event => (
                        <li 
                            key={event.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleEventClick(event)}
                        >
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(event.priority)}`}>
                                            Prioridad {event.priority}
                                        </div>
                                        <p className="ml-3 text-sm font-medium text-gray-900">
                                            {event.event_type} - {event.code}
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(event.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                    <div className="sm:flex">
                                        <p className="text-sm text-gray-500">
                                            {event.raw_message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Modal de evento */}
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-3/4 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Procesar Evento
                            </h3>
                            <button onClick={() => setShowEventModal(false)}>
                                <span className="sr-only">Cerrar</span>
                                <svg 
                                    className="h-6 w-6" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M6 18L18 6M6 6l12 12" 
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Información del cliente */}
                        {selectedEvent.client_info && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                <h4 className="font-medium text-gray-900">Información del Cliente</h4>
                                <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedEvent.client_info.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Empresa</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedEvent.client_info.company}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Código de Verificación</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedEvent.client_info.verification_code}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Dirección</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{selectedEvent.client_info.address}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}

                        {/* Detalles del evento */}
                        <div className="mb-4">
                            <h4 className="font-medium text-gray-900">Detalles del Evento</h4>
                            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEvent.event_type}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Código</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEvent.code}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Mensaje</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEvent.raw_message}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Hora</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(selectedEvent.timestamp).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>

                        {/* Notas y acciones */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Notas
                                </label>
                                <textarea
                                    rows={4}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => handleProcessEvent('ACKNOWLEDGED')}
                                    className="btn btn-secondary"
                                >
                                    Reconocer
                                </button>
                                <button
                                    onClick={() => handleProcessEvent('DISPATCHED')}
                                    className="btn btn-primary"
                                >
                                    Despachar
                                </button>
                                <button
                                    onClick={() => handleProcessEvent('CLOSED')}
                                    className="btn btn-success"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 