import React, { useState, useEffect } from 'react';
import { Client, ClientStatus } from '../../types/client';
import { Modal } from '../common/Modal';
import { ClientForm } from './ClientForm';
import api from '../../utils/api';

export const ClientList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const response = await api.get<{ data: Client[] }>('/clients');
            setClients(response.data.data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const handleSubmit = async (data: Client) => {
        try {
            if (selectedClient) {
                await api.put(`/clients/${selectedClient.id}`, data);
            } else {
                await api.post('/clients', data);
            }
            await loadClients();
            setIsModalOpen(false);
            setSelectedClient(null);
        } catch (error) {
            console.error('Error saving client:', error);
        }
    };

    const filteredClients = statusFilter === 'all'
        ? clients
        : clients.filter(client => client.status === statusFilter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Clientes</h2>
                <button
                    onClick={() => {
                        setSelectedClient(null);
                        setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Nuevo Cliente
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* ... headers ... */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredClients.map(client => (
                            <tr key={client.id}>
                                {/* ... client data ... */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedClient(null);
                }}
                title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
            >
                <ClientForm
                    client={selectedClient || undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setSelectedClient(null);
                    }}
                />
            </Modal>
        </div>
    );
}; 