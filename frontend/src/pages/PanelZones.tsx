import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { useParams } from 'react-router-dom';
import { 
    ShieldCheckIcon, 
    ShieldExclamationIcon,
    ExclamationIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/outline';

interface Zone {
    id: number;
    panel_id: number;
    zone_number: number;
    description: string;
    zone_type: string;
    bypass_allowed: boolean;
    status: 'normal' | 'bypassed' | 'trouble' | 'alarm';
    last_event?: {
        timestamp: string;
        event_type: string;
        description: string;
    };
}

interface Partition {
    id: number;
    panel_id: number;
    partition_number: number;
    name: string;
    status: 'armed' | 'disarmed' | 'partial';
    zones: number[];
}

export default function PanelZones() {
    const { panelId } = useParams<{ panelId: string }>();
    const [zones, setZones] = useState<Zone[]>([]);
    const [partitions, setPartitions] = useState<Partition[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showZoneForm, setShowZoneForm] = useState(false);
    const [showPartitionForm, setShowPartitionForm] = useState(false);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [selectedPartition, setSelectedPartition] = useState<Partition | null>(null);

    const [zoneFormData, setZoneFormData] = useState({
        zone_number: '',
        description: '',
        zone_type: '',
        bypass_allowed: true
    });

    const [partitionFormData, setPartitionFormData] = useState({
        partition_number: '',
        name: '',
        zones: [] as number[]
    });

    useEffect(() => {
        fetchZonesAndPartitions();
    }, [panelId]);

    const fetchZonesAndPartitions = async () => {
        try {
            const [zonesResponse, partitionsResponse] = await Promise.all([
                axiosInstance.get(`/alarm-panels/${panelId}/zones`),
                axiosInstance.get(`/alarm-panels/${panelId}/partitions`)
            ]);

            if (zonesResponse.data.status === 'success') {
                setZones(zonesResponse.data.data);
            }

            if (partitionsResponse.data.status === 'success') {
                setPartitions(partitionsResponse.data.data);
            }

            setError('');
        } catch (err) {
            console.error('Error fetching zones and partitions:', err);
            setError('Error al cargar zonas y particiones');
        } finally {
            setLoading(false);
        }
    };

    const handleZoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`/alarm-panels/${panelId}/zones`, zoneFormData);
            if (response.data.status === 'success') {
                setShowZoneForm(false);
                setZoneFormData({
                    zone_number: '',
                    description: '',
                    zone_type: '',
                    bypass_allowed: true
                });
                fetchZonesAndPartitions();
            }
        } catch (err) {
            console.error('Error creating zone:', err);
            setError('Error al crear zona');
        }
    };

    const handlePartitionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post(`/alarm-panels/${panelId}/partitions`, partitionFormData);
            if (response.data.status === 'success') {
                setShowPartitionForm(false);
                setPartitionFormData({
                    partition_number: '',
                    name: '',
                    zones: []
                });
                fetchZonesAndPartitions();
            }
        } catch (err) {
            console.error('Error creating partition:', err);
            setError('Error al crear partición');
        }
    };

    const handleBypassZone = async (zoneId: number, bypass: boolean) => {
        try {
            const response = await axiosInstance.post(`/alarm-panels/${panelId}/zones/${zoneId}/bypass`, {
                bypass
            });
            if (response.data.status === 'success') {
                fetchZonesAndPartitions();
            }
        } catch (err) {
            console.error('Error bypassing zone:', err);
            setError('Error al anular zona');
        }
    };

    const getZoneStatusIcon = (status: Zone['status']) => {
        switch (status) {
            case 'normal':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'bypassed':
                return <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" />;
            case 'trouble':
                return <ExclamationIcon className="h-5 w-5 text-orange-500" />;
            case 'alarm':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getPartitionStatusIcon = (status: Partition['status']) => {
        switch (status) {
            case 'armed':
                return <ShieldCheckIcon className="h-5 w-5 text-green-500" />;
            case 'disarmed':
                return <ShieldExclamationIcon className="h-5 w-5 text-red-500" />;
            case 'partial':
                return <ShieldExclamationIcon className="h-5 w-5 text-yellow-500" />;
            default:
                return null;
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Zonas y Particiones
                </h2>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setShowZoneForm(true)}
                        className="btn btn-primary"
                    >
                        Nueva Zona
                    </button>
                    <button
                        onClick={() => setShowPartitionForm(true)}
                        className="btn btn-secondary"
                    >
                        Nueva Partición
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de Zonas */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Zonas
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {zones.map((zone) => (
                            <div
                                key={zone.id}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Zona {zone.zone_number}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {zone.description}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            Tipo: {zone.zone_type}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {getZoneStatusIcon(zone.status)}
                                        {zone.bypass_allowed && (
                                            <button
                                                onClick={() => handleBypassZone(zone.id, zone.status !== 'bypassed')}
                                                className={`text-sm ${
                                                    zone.status === 'bypassed'
                                                        ? 'text-yellow-600 hover:text-yellow-500'
                                                        : 'text-gray-600 hover:text-gray-500'
                                                }`}
                                            >
                                                {zone.status === 'bypassed' ? 'Restaurar' : 'Anular'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {zone.last_event && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Último evento: {zone.last_event.description} ({
                                            new Date(zone.last_event.timestamp).toLocaleString()
                                        })
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lista de Particiones */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Particiones
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {partitions.map((partition) => (
                            <div
                                key={partition.id}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Partición {partition.partition_number}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {partition.name}
                                        </p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            Zonas: {partition.zones.join(', ')}
                                        </p>
                                    </div>
                                    {getPartitionStatusIcon(partition.status)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de formulario de zona */}
            {showZoneForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Nueva Zona
                            </h3>
                            <form onSubmit={handleZoneSubmit} className="space-y-4">
                                {/* Campos del formulario */}
                                <button
                                    type="submit"
                                    className="w-full btn btn-primary"
                                >
                                    Crear Zona
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de formulario de partición */}
            {showPartitionForm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Nueva Partición
                            </h3>
                            <form onSubmit={handlePartitionSubmit} className="space-y-4">
                                {/* Campos del formulario */}
                                <button
                                    type="submit"
                                    className="w-full btn btn-primary"
                                >
                                    Crear Partición
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 