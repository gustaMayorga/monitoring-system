import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface ServiceStats {
    pending_services: number;
    in_progress_services: number;
    completed_services: number;
    total_technicians: number;
    average_resolution_time: number;
    customer_satisfaction: number;
}

interface TechnicianStats {
    id: number;
    name: string;
    completed_services: number;
    average_rating: number;
    current_load: number;
}

export default function ServiceDashboard() {
    const [stats, setStats] = useState<ServiceStats | null>(null);
    const [technicians, setTechnicians] = useState<TechnicianStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState('week');

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 60000); // Actualizar cada minuto
        return () => clearInterval(interval);
    }, [dateRange]);

    const fetchDashboardData = async () => {
        try {
            const [statsResponse, techResponse] = await Promise.all([
                axiosInstance.get('/reports/service-statistics', {
                    params: { period: dateRange }
                }),
                axiosInstance.get('/reports/technician-performance')
            ]);

            if (statsResponse.data.status === 'success') {
                setStats(statsResponse.data.data);
            }

            if (techResponse.data.status === 'success') {
                setTechnicians(techResponse.data.data);
            }

            setError('');
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            setError('Error al cargar datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;

    if (error) return <div className="text-red-600 p-4">{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Dashboard de Servicios Técnicos
                </h2>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="input"
                >
                    <option value="day">Hoy</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mes</option>
                    <option value="year">Este Año</option>
                </select>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Servicios Pendientes"
                    value={stats?.pending_services || 0}
                    trend={10}
                    trendLabel="vs semana anterior"
                    className="bg-yellow-50"
                />
                <StatCard
                    title="En Progreso"
                    value={stats?.in_progress_services || 0}
                    trend={-5}
                    trendLabel="vs semana anterior"
                    className="bg-blue-50"
                />
                <StatCard
                    title="Completados"
                    value={stats?.completed_services || 0}
                    trend={15}
                    trendLabel="vs semana anterior"
                    className="bg-green-50"
                />
                <StatCard
                    title="Tiempo Promedio"
                    value={`${stats?.average_resolution_time || 0}min`}
                    trend={-8}
                    trendLabel="vs promedio"
                    className="bg-purple-50"
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Servicios por Estado</h3>
                    <div className="h-64">
                        <Pie
                            data={{
                                labels: ['Pendientes', 'En Progreso', 'Completados'],
                                datasets: [{
                                    data: [
                                        stats?.pending_services || 0,
                                        stats?.in_progress_services || 0,
                                        stats?.completed_services || 0
                                    ],
                                    backgroundColor: [
                                        'rgba(251, 191, 36, 0.5)',
                                        'rgba(59, 130, 246, 0.5)',
                                        'rgba(34, 197, 94, 0.5)'
                                    ],
                                    borderColor: [
                                        'rgb(251, 191, 36)',
                                        'rgb(59, 130, 246)',
                                        'rgb(34, 197, 94)'
                                    ],
                                    borderWidth: 1
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false
                            }}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium mb-4">Rendimiento de Técnicos</h3>
                    <div className="h-64">
                        <Bar
                            data={{
                                labels: technicians.map(t => t.name),
                                datasets: [{
                                    label: 'Servicios Completados',
                                    data: technicians.map(t => t.completed_services),
                                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                                    borderColor: 'rgb(59, 130, 246)',
                                    borderWidth: 1
                                }]
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de técnicos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium">Resumen de Técnicos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Técnico
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Servicios Completados
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Calificación
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Carga Actual
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {technicians.map((tech) => (
                                <tr key={tech.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {tech.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {tech.completed_services}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <div className="flex items-center">
                                            <span className="text-yellow-400">★</span>
                                            <span className="ml-1">{tech.average_rating.toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{ width: `${tech.current_load}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs mt-1">{tech.current_load}%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number | string;
    trend: number;
    trendLabel: string;
    className?: string;
}

function StatCard({ title, value, trend, trendLabel, className = '' }: StatCardProps) {
    return (
        <div className={`rounded-lg shadow p-6 ${className}`}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {value}
                </p>
                <p className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                    {trend > 0 ? '↑' : '↓'}
                    {Math.abs(trend)}%
                </p>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{trendLabel}</p>
        </div>
    );
} 