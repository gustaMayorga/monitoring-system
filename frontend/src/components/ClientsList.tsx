import React, { useState, useEffect } from 'react';
import { clientService } from '../services/api';

export const ClientList = () => {
    const [clients, setClients] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '' });

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            const data = await clientService.getAll();
            setClients(data.items || []);
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await clientService.create(formData);
            setFormData({ name: '', email: '' });
            loadClients();
        } catch (error) {
            console.error('Error creating client:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Gestión de Clientes</h1>
            
            <form onSubmit={handleSubmit} className="mb-8">
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

            <table className="min-w-full bg-white shadow rounded">
                <thead>
                    <tr>
                        <th className="p-3 text-left">Nombre</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client: any) => (
                        <tr key={client.id} className="border-t">
                            <td className="p-3">{client.name}</td>
                            <td className="p-3">{client.email}</td>
                            <td className="p-3">
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
    );
};