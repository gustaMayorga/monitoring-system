import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Role } from '../../types/role';
import { Modal } from '../common/Modal';
import { RoleForm } from './RoleForm';
import { RolePermissions } from './RolePermissions';

export const RoleList: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data.data);
        } catch (error) {
            setError('Error al cargar los roles');
            console.error('Error loading roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (roleId: number) => {
        if (!window.confirm('¿Está seguro de eliminar este rol?')) return;

        try {
            await api.delete(`/roles/${roleId}`);
            await loadRoles();
        } catch (error) {
            if (api.isAxiosError(error)) {
                alert(error.response?.data?.message || 'Error al eliminar el rol');
            } else {
                alert('Error inesperado al eliminar el rol');
            }
        }
    };

    const handleEdit = (role: Role) => {
        setSelectedRole(role);
        setIsFormOpen(true);
    };

    const handlePermissions = (role: Role) => {
        setSelectedRole(role);
        setIsPermissionsOpen(true);
    };

    const handleFormClose = () => {
        setSelectedRole(null);
        setIsFormOpen(false);
    };

    const handleFormSubmit = async () => {
        await loadRoles();
        handleFormClose();
    };

    const handlePermissionsClose = () => {
        setSelectedRole(null);
        setIsPermissionsOpen(false);
    };

    if (loading) return <div>Cargando roles...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Roles</h2>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => setIsFormOpen(true)}
                >
                    Nuevo Rol
                </button>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {roles.map(role => (
                        <li key={role.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                                    <p className="text-sm text-gray-500">{role.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                        onClick={() => handlePermissions(role)}
                                    >
                                        Permisos
                                    </button>
                                    <button
                                        className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                        onClick={() => handleEdit(role)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        onClick={() => handleDelete(role.id)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Modal para crear/editar rol */}
            <Modal isOpen={isFormOpen} onClose={handleFormClose}>
                <RoleForm
                    role={selectedRole}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormClose}
                />
            </Modal>

            {/* Modal para gestionar permisos */}
            <Modal isOpen={isPermissionsOpen} onClose={handlePermissionsClose}>
                {selectedRole && (
                    <RolePermissions
                        role={selectedRole}
                        onClose={handlePermissionsClose}
                    />
                )}
            </Modal>
        </div>
    );
}; 