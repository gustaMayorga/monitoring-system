import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Permission } from '../../types/permission';
import { Role } from '../../types/role';

interface RolePermissionsProps {
    role: Role;
    onClose: () => void;
}

export const RolePermissions: React.FC<RolePermissionsProps> = ({ role, onClose }) => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [role.id]);

    const loadData = async () => {
        try {
            const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
                axios.get<{ data: Permission[] }>('/api/permissions'),
                axios.get<{ data: string[] }>(`/api/roles/${role.id}/permissions`)
            ]);

            setPermissions(permissionsResponse.data.data);
            setSelectedPermissions(rolePermissionsResponse.data.data);
        } catch (error) {
            setError('Error al cargar los permisos');
            console.error('Error loading permissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/roles/${role.id}/permissions`, {
                permissions: selectedPermissions
            });
            onClose();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Error al guardar los permisos');
            } else {
                setError('Error inesperado');
            }
        } finally {
            setSaving(false);
        }
    };

    const togglePermission = (permissionName: string) => {
        setSelectedPermissions(prev => 
            prev.includes(permissionName)
                ? prev.filter(p => p !== permissionName)
                : [...prev, permissionName]
        );
    };

    const groupedPermissions = permissions.reduce((groups, permission) => {
        const resource = permission.resource;
        if (!groups[resource]) {
            groups[resource] = [];
        }
        groups[resource].push(permission);
        return groups;
    }, {} as Record<string, Permission[]>);

    if (loading) return <div>Cargando permisos...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Permisos del rol: {role.name}</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, permissions]) => (
                    <div key={resource} className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 uppercase">{resource}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {permissions.map(permission => (
                                <label
                                    key={permission.id}
                                    className="flex items-center space-x-3 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(permission.name)}
                                        onChange={() => togglePermission(permission.name)}
                                        disabled={saving}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-gray-700">{permission.description || permission.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </div>
    );
}; 