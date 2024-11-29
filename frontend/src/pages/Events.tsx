import React, { useState, useEffect } from 'react';
import PageContainer from '../components/Layout/PageContainer';

interface Event {
    id: number;
    device_id: number;
    type: string;
    description: string;
    status: string;
    created_at: string;
}

const API_URL = 'http://127.0.0.1:8000';

export default function Events() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch(`${API_URL}/events`);
            const data = await response.json();
            
            if (data.status === 'success') {
                setEvents(data.data);
            } else {
                setError(data.detail || 'Error al cargar los eventos');
            }
        } catch (err) {
            console.error('Error:', err);
            setError('Error al cargar los eventos');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageContainer title="Events">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer 
            title="Events" 
            subtitle="Monitor system events and activities"
        >
            {/* Header Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <div className="absolute left-3 top-2.5">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="">All Types</option>
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                    </select>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add Event
                    </button>
                </div>
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

            {/* Events List */}
            <div className="space-y-4">
                {events.map(event => (
                    <div key={event.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Device #{event.device_id} - {event.type}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                event.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {event.status}
                            </span>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-500">
                                {new Date(event.created_at).toLocaleString()}
                            </span>
                            <div className="flex space-x-2">
                                <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                                    Details
                                </button>
                                <button className="text-red-600 hover:text-red-900 text-sm">
                                    Archive
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