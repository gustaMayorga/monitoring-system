import React, { useState, useEffect } from 'react';
import clientService, { Client } from '../../services/clientService';

const ClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [formData, setFormData] = useState<Client>({
        name: '',
        email: ''
    });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await clientService.getAll();
            setClients(data);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await clientService.create(formData);
            loadClients();
            setFormData({ name: '', email: '' });
        } catch (error) {
            console.error('Error creating client:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Gestión de Clientes</h2>
            
            <form onSubmit={handleSubmit} className="mb-6">
                <div className="flex gap-4 mb-4">
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nombre"
                        className="p-2 border rounded flex-1"
                    />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Email"
                        className="p-2 border rounded flex-1"
                    />
                    <button 
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Agregar Cliente
                    </button>
                </div>
            </form>

            <div className="bg-white shadow rounded-lg">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nombre</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {clients.map(client => (
                            <tr key={client.id}>
                                <td className="px-6 py-4">{client.name}</td>
                                <td className="px-6 py-4">{client.email}</td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => client.id && clientService.delete(client.id).then(loadClients)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientsPage;