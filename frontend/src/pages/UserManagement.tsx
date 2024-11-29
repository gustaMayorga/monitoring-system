import { useState, useEffect } from 'react';

interface User {
    id: number;
    username: string;
    is_active: boolean;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8000/users');
            if (!response.ok) throw new Error('Error al cargar usuarios');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>
            <button className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
                Nuevo Usuario
            </button>
            
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="px-6 py-3 border-b">ID</th>
                        <th className="px-6 py-3 border-b">Usuario</th>
                        <th className="px-6 py-3 border-b">Estado</th>
                        <th className="px-6 py-3 border-b">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 border-b">{user.id}</td>
                            <td className="px-6 py-4 border-b">{user.username}</td>
                            <td className="px-6 py-4 border-b">
                                {user.is_active ? 'Activo' : 'Inactivo'}
                            </td>
                            <td className="px-6 py-4 border-b">
                                <button className="text-blue-500 hover:text-blue-700 mr-2">
                                    Editar
                                </button>
                                <button className="text-red-500 hover:text-red-700">
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

export default UserManagement; 