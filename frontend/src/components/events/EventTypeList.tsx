import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { EventType } from '../../types/event';
import { Modal } from '../common/Modal';
import { EventTypeForm } from './EventTypeForm';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { SearchBar } from '../common/SearchBar';

export const EventTypeList: React.FC = () => {
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadEventTypes();
    }, []);

    const loadEventTypes = async () => {
        try {
            const response = await api.get<{ data: EventType[] }>('/event-types');
            setEventTypes(response.data.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los tipos de eventos');
            console.error('Error loading event types:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (data: Partial<EventType>) => {
        try {
            await api.post('/event-types', data);
            await loadEventTypes();
            setIsModalOpen(false);
        } catch (err) {
            setError('Error al crear el tipo de evento');
            console.error('Error creating event type:', err);
        }
    };

    const handleUpdate = async (data: Partial<EventType>) => {
        if (!selectedEventType) return;
        try {
            await api.put(`/event-types/${selectedEventType.id}`, data);
            await loadEventTypes();
            setIsModalOpen(false);
            setSelectedEventType(null);
        } catch (err) {
            setError('Error al actualizar el tipo de evento');
            console.error('Error updating event type:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este tipo de evento?')) return;
        try {
            await api.delete(`/event-types/${id}`);
            await loadEventTypes();
        } catch (err) {
            setError('Error al eliminar el tipo de evento');
            console.error('Error deleting event type:', err);
        }
    };

    const filteredEventTypes = eventTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Tipos de Eventos</h2>
                <button
                    onClick={() => {
                        setSelectedEventType(null);
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Nuevo Tipo
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <SearchBar
                onSearch={setSearchTerm}
                placeholder="Buscar tipos de eventos..."
                className="max-w-md"
            />

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {filteredEventTypes.map((type) => (
                        <li key={type.id} className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {type.name}
                                    </h3>
                                    {type.description && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {type.description}
                                        </p>
                                    )}
                                    <div className="mt-2 flex items-center space-x-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                type.severity === 'critical'
                                                    ? 'bg-red-100 text-red-800'
                                                    : type.severity === 'error'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : type.severity === 'warning'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            {type.severity}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedEventType(type);
                                            setIsModalOpen(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(type.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedEventType(null);
                }}
            >
                <EventTypeForm
                    eventType={selectedEventType}
                    onSubmit={selectedEventType ? handleUpdate : handleCreate}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedEventType(null);
                    }}
                />
            </Modal>
        </div>
    );
}; 