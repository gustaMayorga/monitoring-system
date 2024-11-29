import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Usuario {
    id: number;
    username: string;
    is_active: boolean;
}

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newUser, setNewUser] = useState({ username: '', password: '' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('http://localhost:8000/users');
            setUsuarios(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al cargar usuarios');
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/users', newUser);
            setNewUser({ username: '', password: '' });
            setShowForm(false);
            fetchUsuarios();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al crear usuario');
        }
    };

    const toggleUserStatus = async (id: number, is_active: boolean) => {
        try {
            await axios.put(`http://localhost:8000/users/${id}`, { is_active: !is_active });
            fetchUsuarios();
        } catch (err) {
            setError('Error al actualizar usuario');
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Usuarios</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    {showForm ? 'Cancelar' : 'Nuevo Usuario'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usuario</label>
                        <input
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Crear Usuario
                    </button>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {usuarios.map((usuario) => (
                            <tr key={usuario.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{usuario.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{usuario.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        usuario.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {usuario.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => toggleUserStatus(usuario.id, usuario.is_active)}
                                        className={`${
                                            usuario.is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                        } text-white px-3 py-1 rounded`}
                                    >
                                        {usuario.is_active ? 'Desactivar' : 'Activar'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 