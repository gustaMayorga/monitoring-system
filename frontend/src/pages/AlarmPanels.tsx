import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';

interface AlarmPanel {
    id: number;
    client_id: number;
    account_number: string;
    verification_code: string;
    panel_type: string;
    model: string;
    phone_line1: string;
    phone_line2: string;
    ip_address: string;
    port: number;
    notes: string;
    created_at: string;
    last_connection: string;
    client_name?: string;
    client_company?: string;
}

interface FormData {
    id?: number;
    client_id: number;
    account_number: string;
    verification_code: string;
    panel_type: string;
    model: string;
    phone_line1: string;
    phone_line2: string;
    ip_address: string;
    port: number;
    notes: string;
    protocol: string;
}

export default function AlarmPanels() {
    const [panels, setPanels] = useState<AlarmPanel[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        client_id: 0,
        account_number: '',
        verification_code: '',
        panel_type: '',
        model: '',
        phone_line1: '',
        phone_line2: '',
        ip_address: '',
        port: 0,
        notes: '',
        protocol: ''
    });
    const [clients, setClients] = useState<{id: number, name: string}[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPanels();
        fetchClients();
    }, []);

    const fetchPanels = async () => {
        try {
            const response = await axiosInstance.get('/alarm-panels');
            if (response.data.status === 'success') {
                setPanels(response.data.data);
            }
        } catch (err) {
            setError('Error al cargar paneles');
        }
    };

    const fetchClients = async () => {
        try {
            const response = await axiosInstance.get('/clients');
            if (response.data.status === 'success') {
                setClients(response.data.data);
            }
        } catch (err) {
            setError('Error al cargar clientes');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/alarm-panels', formData);
            if (response.data.status === 'success') {
                setShowForm(false);
                setFormData({
                    client_id: 0,
                    account_number: '',
                    verification_code: '',
                    panel_type: '',
                    model: '',
                    phone_line1: '',
                    phone_line2: '',
                    ip_address: '',
                    port: 0,
                    notes: '',
                    protocol: ''
                });
                fetchPanels();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al crear panel');
        }
    };

    const handleEdit = async (panel: AlarmPanel) => {
        setFormData({
            id: panel.id,
            client_id: panel.client_id,
            account_number: panel.account_number,
            verification_code: panel.verification_code,
            panel_type: panel.panel_type,
            model: panel.model,
            phone_line1: panel.phone_line1,
            phone_line2: panel.phone_line2,
            ip_address: panel.ip_address,
            port: panel.port,
            notes: panel.notes,
            protocol: panel.protocol
        });
        setShowForm(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id) return;

        try {
            const response = await axiosInstance.put(`/alarm-panels/${formData.id}`, formData);
            if (response.data.status === 'success') {
                setShowForm(false);
                setFormData({
                    client_id: 0,
                    account_number: '',
                    verification_code: '',
                    panel_type: '',
                    model: '',
                    phone_line1: '',
                    phone_line2: '',
                    ip_address: '',
                    port: 0,
                    notes: '',
                    protocol: ''
                });
                fetchPanels();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al actualizar panel');
        }
    };

    const handleDelete = async (panel: AlarmPanel) => {
        if (!confirm(`¿Estás seguro de eliminar el panel ${panel.account_number}?`)) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/alarm-panels/${panel.id}`);
            if (response.data.status === 'success') {
                fetchPanels();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al eliminar panel');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Paneles de Alarma</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                >
                    Nuevo Panel
                </button>
            </div>

            {/* Lista de paneles */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Número de Cuenta
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Última Conexión
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {panels.map(panel => (
                            <tr key={panel.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {panel.client_name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {panel.client_company}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {panel.account_number}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {panel.panel_type}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {panel.model}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {panel.last_connection ? new Date(panel.last_connection).toLocaleString() : 'Nunca'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(panel)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(panel)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de formulario */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {formData.id ? 'Editar Panel' : 'Nuevo Panel'}
                            </h3>
                            <button onClick={() => setShowForm(false)}>
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

                        <form onSubmit={formData.id ? handleUpdate : handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Cliente
                                </label>
                                <select
                                    required
                                    value={formData.client_id}
                                    onChange={(e) => setFormData({ ...formData, client_id: parseInt(e.target.value) })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">Seleccionar cliente...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Resto de campos del formulario */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Número de Cuenta
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.account_number}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            {/* ... Agregar campos similares para el resto de propiedades ... */}

                            <div className="mt-5 flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    {formData.id ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
} 