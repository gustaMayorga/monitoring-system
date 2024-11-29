import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../context/AuthContext';

interface User {
    id: number;
    username: string;
    role: string;
    is_active: boolean;
    last_login?: Date;
    created_at: Date;
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

const ROLES: Role[] = [
    {
        id: 'admin',
        name: 'Administrador',
        description: 'Acceso total al sistema',
        permissions: ['all']
    },
    {
        id: 'administrative',
        name: 'Administrativo',
        description: 'Gestión de clientes y facturación',
        permissions: ['clients.read', 'clients.write', 'billing.read', 'billing.write']
    },
    {
        id: 'operator',
        name: 'Operador',
        description: 'Monitoreo y gestión de alarmas',
        permissions: ['alarms.read', 'alarms.write', 'cameras.read']
    },
    {
        id: 'technical',
        name: 'Técnico',
        description: 'Mantenimiento y soporte técnico',
        permissions: ['devices.read', 'devices.write', 'support.read', 'support.write']
    }
];

interface FormData {
    id?: number;
    username: string;
    password: string;
    role: string;
    is_active: boolean;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
        role: '',
        is_active: true
    });
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const { user: currentUserAuth } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/users');
            if (response.data.status === 'success') {
                setUsers(response.data.data);
            }
        } catch (err) {
            setError('Error al cargar usuarios');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post('/users', {
                username: formData.username,
                password: formData.password,
                role: formData.role
            });

            if (response.data.status === 'success') {
                setShowForm(false);
                setFormData({
                    username: '',
                    password: '',
                    role: '',
                    is_active: true
                });
                fetchUsers();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al crear usuario');
        }
    };

    const handleToggleStatus = async (user: User) => {
        try {
            const response = await axiosInstance.put(`/users/${user.id}`, {
                is_active: !user.is_active
            });

            if (response.data) {
                // Actualizar la lista de usuarios
                fetchUsers();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al actualizar usuario');
        }
    };

    const handleEdit = async (user: User) => {
        setFormData({
            id: user.id,
            username: user.username,
            password: '', // No mostramos la contraseña actual
            role: user.role,
            is_active: user.is_active
        });
        setShowForm(true);
    };

    const handleDelete = async (user: User) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar al usuario ${user.username}?`)) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/users/${user.id}`);
            if (response.data.status === 'success') {
                fetchUsers();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al eliminar usuario');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.put(`/users/${formData.id}`, {
                username: formData.username,
                role: formData.role,
                is_active: formData.is_active,
                ...(formData.password ? { password: formData.password } : {})
            });

            if (response.data.status === 'success') {
                setShowForm(false);
                setFormData({
                    username: '',
                    password: '',
                    role: '',
                    is_active: true
                });
                fetchUsers();
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Error al actualizar usuario');
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Usuarios</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                >
                    Nuevo Usuario
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Último Acceso
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <span className="text-indigo-600 font-semibold text-lg">
                                                    {user.username[0].toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.username}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <RoleBadge role={user.role} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge isActive={user.is_active} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Editar
                                    </button>
                                    {currentUserAuth?.role === 'admin' && user.id !== currentUserAuth.id && (
                                        <button
                                            onClick={() => handleDelete(user)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {formData.id ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-500">
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
                                    Usuario
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Rol
                                </label>
                                <select
                                    required
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="input"
                                >
                                    <option value="">Seleccionar rol...</option>
                                    {ROLES.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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

const RoleBadge = ({ role }: { role: string }) => {
    const roleColors: { [key: string]: string } = {
        admin: 'bg-purple-100 text-purple-800',
        administrative: 'bg-blue-100 text-blue-800',
        operator: 'bg-green-100 text-green-800',
        technical: 'bg-yellow-100 text-yellow-800'
    };

    const roleName: { [key: string]: string } = {
        admin: 'Administrador',
        administrative: 'Administrativo',
        operator: 'Operador',
        technical: 'Técnico'
    };

    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}>
            {roleName[role] || role}
        </span>
    );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
        {isActive ? 'Activo' : 'Inactivo'}
    </span>
); 