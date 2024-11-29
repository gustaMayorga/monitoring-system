import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ShieldExclamationIcon,
    UserIcon,
    VideoCameraIcon,
    BellIcon,
    ClockIcon,
    ExclamationIcon,
    CheckCircleIcon
} from '@heroicons/react/solid';

interface DashboardStats {
    active_alarms: number;
    active_troubles: number;
    online_panels: number;
    offline_panels: number;
    online_cameras: number;
    offline_cameras: number;
    pending_services: number;
    active_technicians: number;
}

interface RecentEvent {
    id: number;
    timestamp: string;
    event_type: string;
    description: string;
    source: string;
    priority: 'high' | 'medium' | 'low';
    status: 'new' | 'acknowledged' | 'resolved';
}

interface ActiveService {
    id: number;
    client_name: string;
    service_type: string;
    technician_name: string;
    start_time: string;
    estimated_duration: number;
    status: string;
    progress: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
    const [activeServices, setActiveServices] = useState<ActiveService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshInterval, setRefreshInterval] = useState(30); // segundos

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, refreshInterval * 1000);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, eventsResponse, servicesResponse] = await Promise.all([
                axiosInstance.get('/dashboard/stats'),
                axiosInstance.get('/dashboard/recent-events'),
                axiosInstance.get('/dashboard/active-services')
            ]);

            if (statsResponse.data.status === 'success') {
                setStats(statsResponse.data.data);
            }

            if (eventsResponse.data.status === 'success') {
                setRecentEvents(eventsResponse.data.data);
            }

            if (servicesResponse.data.status === 'success') {
                setActiveServices(servicesResponse.data.data);
            }

            setError('');
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    const getEventPriorityClass = (priority: RecentEvent['priority']) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getEventStatusIcon = (status: RecentEvent['status']) => {
        switch (status) {
            case 'new': return <ExclamationIcon className="h-5 w-5 text-yellow-500" />;
            case 'acknowledged': return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
            case 'resolved': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            default: return null;
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Panel de Control
                </h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Actualización:</span>
                    <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        className="input"
                    >
                        <option value="10">10s</option>
                        <option value="30">30s</option>
                        <option value="60">1m</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard
                        title="Alarmas Activas"
                        value={stats.active_alarms}
                        icon={<BellIcon className="h-6 w-6" />}
                        type={stats.active_alarms > 0 ? 'danger' : 'success'}
                    />
                    <StatCard
                        title="Paneles Online/Offline"
                        value={`${stats.online_panels}/${stats.offline_panels}`}
                        icon={<ShieldExclamationIcon className="h-6 w-6" />}
                        type={stats.offline_panels > 0 ? 'warning' : 'success'}
                    />
                    <StatCard
                        title="Cámaras Online/Offline"
                        value={`${stats.online_cameras}/${stats.offline_cameras}`}
                        icon={<VideoCameraIcon className="h-6 w-6" />}
                        type={stats.offline_cameras > 0 ? 'warning' : 'success'}
                    />
                    <StatCard
                        title="Técnicos Activos"
                        value={stats.active_technicians}
                        icon={<UserIcon className="h-6 w-6" />}
                        type="info"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Eventos Recientes */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Eventos Recientes
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentEvents.map((event) => (
                            <div
                                key={event.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {event.description}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {event.source}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            getEventPriorityClass(event.priority)
                                        }`}>
                                            {event.priority}
                                        </span>
                                        {getEventStatusIcon(event.status)}
                                    </div>
                                </div>
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {format(new Date(event.timestamp), 'PPp', { locale: es })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Servicios Activos */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Servicios Activos
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {activeServices.map((service) => (
                            <div
                                key={service.id}
                                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {service.client_name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {service.service_type}
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {service.technician_name}
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>Progreso: {service.progress}%</span>
                                        <span>
                                            <ClockIcon className="h-4 w-4 inline mr-1" />
                                            {format(new Date(service.start_time), 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${service.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    type: 'success' | 'warning' | 'danger' | 'info';
}

function StatCard({ title, value, icon, type }: StatCardProps) {
    const getTypeClasses = () => {
        switch (type) {
            case 'success': return 'bg-green-50 text-green-600';
            case 'warning': return 'bg-yellow-50 text-yellow-600';
            case 'danger': return 'bg-red-50 text-red-600';
            case 'info': return 'bg-blue-50 text-blue-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className={`rounded-lg shadow p-6 ${getTypeClasses()}`}>
            <div className="flex justify-between items-center">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium truncate">
                            {title}
                        </dt>
                        <dd className="text-3xl font-semibold">
                            {value}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
} 