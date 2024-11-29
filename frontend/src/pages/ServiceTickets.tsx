import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    ChatAlt2Icon,
    ClockIcon,
    LightningBoltIcon,
    UserIcon,
    LocationMarkerIcon,
    DocumentTextIcon
} from '@heroicons/react/outline';

interface ServiceTicket {
    id: number;
    client_id: number;
    client_name: string;
    category: string;
    subcategory: string;
    priority: number;
    description: string;
    status: string;
    created_by: number;
    created_by_name: string;
    created_at: string;
    estimated_time: number;
    assigned_to?: number;
    assigned_to_name?: string;
    location_lat?: number;
    location_lon?: number;
    address?: string;
    ai_suggestions?: {
        solution: string;
        confidence: number;
        similar_cases: string[];
        estimated_time: number;
    };
}

interface Comment {
    id: number;
    ticket_id: number;
    user_id: number;
    user_name: string;
    content: string;
    created_at: string;
    attachments?: string[];
}

export default function ServiceTickets() {
    const [tickets, setTickets] = useState<ServiceTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    const [formData, setFormData] = useState({
        client_id: '',
        category: '',
        subcategory: '',
        priority: '2',
        description: '',
        estimated_time: '',
        address: ''
    });

    useEffect(() => {
        fetchTickets();
    }, [filterStatus, filterPriority]);

    const fetchTickets = async () => {
        try {
            const response = await axiosInstance.get('/service-tickets', {
                params: {
                    status: filterStatus !== 'all' ? filterStatus : undefined,
                    priority: filterPriority !== 'all' ? filterPriority : undefined
                }
            });
            if (response.data.status === 'success') {
                setTickets(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError('Error al cargar tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (ticketId: number) => {
        try {
            const response = await axiosInstance.get(`/service-tickets/${ticketId}/comments`);
            if (response.data.status === 'success') {
                setComments(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/service-tickets', formData);
            if (response.data.status === 'success') {
                setShowForm(false);
                setFormData({
                    client_id: '',
                    category: '',
                    subcategory: '',
                    priority: '2',
                    description: '',
                    estimated_time: '',
                    address: ''
                });
                fetchTickets();
            }
        } catch (err) {
            console.error('Error creating ticket:', err);
            setError('Error al crear ticket');
        }
    };

    const handleAddComment = async (ticketId: number) => {
        try {
            const response = await axiosInstance.post(`/service-tickets/${ticketId}/comments`, {
                content: newComment
            });
            if (response.data.status === 'success') {
                setNewComment('');
                fetchComments(ticketId);
            }
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Error al agregar comentario');
        }
    };

    const handleGetAISuggestions = async (ticketId: number) => {
        try {
            const response = await axiosInstance.post(`/service-tickets/${ticketId}/ai-analysis`, {
                analysis_type: 'solution_prediction'
            });
            if (response.data.status === 'success') {
                // Actualizar el ticket con las sugerencias
                setTickets(tickets.map(ticket => 
                    ticket.id === ticketId 
                        ? { ...ticket, ai_suggestions: response.data.data }
                        : ticket
                ));
            }
        } catch (err) {
            console.error('Error getting AI suggestions:', err);
            setError('Error al obtener sugerencias de IA');
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
                    Tickets de Servicio
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
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="input"
                    >
                        <option value="all">Todas las prioridades</option>
                        <option value="1">Alta</option>
                        <option value="2">Media</option>
                        <option value="3">Baja</option>
                    </select>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                    >
                        Nuevo Ticket
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {ticket.client_name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {ticket.category} - {ticket.subcategory}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityClass(ticket.priority)}`}>
                                        P{ticket.priority}
                                    </span>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {ticket.description}
                                </p>

                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <UserIcon className="h-4 w-4 mr-1" />
                                    {ticket.assigned_to_name || 'Sin asignar'}
                                </div>

                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {format(new Date(ticket.created_at), 'PPp', { locale: es })}
                                </div>

                                {ticket.address && (
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <LocationMarkerIcon className="h-4 w-4 mr-1" />
                                        {ticket.address}
                                    </div>
                                )}
                            </div>

                            {ticket.ai_suggestions && (
                                <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <LightningBoltIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                                        <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                                            Sugerencias de IA
                                        </h4>
                                    </div>
                                    <p className="text-sm text-indigo-700 dark:text-indigo-200">
                                        {ticket.ai_suggestions.solution}
                                    </p>
                                    <div className="mt-2 flex justify-between text-xs text-indigo-600 dark:text-indigo-300">
                                        <span>Confianza: {(ticket.ai_suggestions.confidence * 100).toFixed(0)}%</span>
                                        <span>Tiempo estimado: {ticket.ai_suggestions.estimated_time} min</span>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex justify-between">
                                <button
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    <ChatAlt2Icon className="h-5 w-5 inline mr-1" />
                                    Comentarios
                                </button>
                                {!ticket.ai_suggestions && (
                                    <button
                                        onClick={() => handleGetAISuggestions(ticket.id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-500"
                                    >
                                        <LightningBoltIcon className="h-5 w-5 inline mr-1" />
                                        Obtener sugerencias
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de comentarios */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Comentarios
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-4">
                                {comments.map((comment) => (
                                    <div
                                        key={comment.id}
                                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center">
                                                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {comment.user_name}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {format(new Date(comment.created_at), 'PPp', { locale: es })}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                                            {comment.content}
                                        </p>
                                        {comment.attachments && comment.attachments.length > 0 && (
                                            <div className="mt-2 flex items-center space-x-2">
                                                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {comment.attachments.length} adjuntos
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Escribe un comentario..."
                                    className="input flex-1"
                                />
                                <button
                                    onClick={() => handleAddComment(selectedTicket.id)}
                                    className="btn btn-primary"
                                    disabled={!newComment.trim()}
                                >
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Nuevo Ticket
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Campos del formulario */}
                                <button
                                    type="submit"
                                    className="w-full btn btn-primary"
                                >
                                    Crear Ticket
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 