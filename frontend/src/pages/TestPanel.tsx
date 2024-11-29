import React, { useState } from 'react';
import axiosInstance from '../utils/axios';

const TEST_EVENTS = [
    {
        name: "Robo Zona 1",
        code: "BA",
        zone: "1",
        description: "Alarma de robo en zona 1",
        priority: "Alta"
    },
    {
        name: "Fuego Zona 2",
        code: "FA",
        zone: "2",
        description: "Alarma de incendio en zona 2",
        priority: "Alta"
    },
    {
        name: "Pánico",
        code: "PA",
        zone: "0",
        description: "Botón de pánico activado",
        priority: "Alta"
    },
    {
        name: "Fallo AC",
        code: "AT",
        zone: "0",
        description: "Corte de energía eléctrica",
        priority: "Media"
    },
    {
        name: "Batería Baja",
        code: "YT",
        zone: "0",
        description: "Batería del panel baja",
        priority: "Media"
    }
];

export default function TestPanel() {
    const [accountNumber, setAccountNumber] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(TEST_EVENTS[0]);
    const [response, setResponse] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendEvent = async () => {
        if (!accountNumber) {
            setError('Por favor ingrese un número de cuenta');
            return;
        }

        setLoading(true);
        try {
            const response = await axiosInstance.post('/test/send-event', {
                account_number: accountNumber,
                event_code: selectedEvent.code,
                zone: selectedEvent.zone
            });

            setResponse(JSON.stringify(response.data, null, 2));
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al enviar evento');
            setResponse('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Panel de Pruebas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel de Control */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Control de Eventos</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Número de Cuenta
                            </label>
                            <input
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Ej: 1234"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Evento
                            </label>
                            <select
                                value={TEST_EVENTS.indexOf(selectedEvent)}
                                onChange={(e) => setSelectedEvent(TEST_EVENTS[parseInt(e.target.value)])}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                                {TEST_EVENTS.map((event, index) => (
                                    <option key={index} value={index}>
                                        {event.name} - {event.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <button
                                onClick={handleSendEvent}
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} 
                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            >
                                {loading ? 'Enviando...' : 'Enviar Evento'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Panel de Información */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles del Evento</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Evento Seleccionado</h4>
                            <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Código</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEvent.code}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Zona</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEvent.zone}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Prioridad</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEvent.priority}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{selectedEvent.description}</dd>
                                </div>
                            </dl>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded p-4">
                                <pre className="text-red-600 text-sm whitespace-pre-wrap">{error}</pre>
                            </div>
                        )}

                        {response && (
                            <div className="bg-green-50 border border-green-200 rounded p-4">
                                <pre className="text-green-600 text-sm whitespace-pre-wrap">{response}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 