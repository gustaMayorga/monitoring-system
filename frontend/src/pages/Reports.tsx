import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Line,
    Bar,
    Pie,
    LineChart,
    BarChart,
    PieChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import {
    DocumentDownloadIcon,
    FilterIcon,
    RefreshIcon
} from '@heroicons/react/outline';

interface EventStats {
    date: string;
    total: number;
    alarms: number;
    troubles: number;
    supervisory: number;
}

interface TechnicianStats {
    technician_name: string;
    completed_services: number;
    average_time: number;
    satisfaction_rate: number;
}

interface ClientStats {
    client_name: string;
    total_events: number;
    false_alarms: number;
    service_calls: number;
}

export default function Reports() {
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('week');
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [eventStats, setEventStats] = useState<EventStats[]>([]);
    const [technicianStats, setTechnicianStats] = useState<TechnicianStats[]>([]);
    const [clientStats, setClientStats] = useState<ClientStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportType, setReportType] = useState<'events' | 'technicians' | 'clients'>('events');

    useEffect(() => {
        if (dateRange === 'week') {
            setStartDate(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
            setEndDate(format(new Date(), 'yyyy-MM-dd'));
        } else if (dateRange === 'month') {
            setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
            setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
        }
    }, [dateRange]);

    useEffect(() => {
        fetchReportData();
    }, [startDate, endDate, reportType]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/reports/statistics', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    type: reportType
                }
            });

            if (response.data.status === 'success') {
                switch (reportType) {
                    case 'events':
                        setEventStats(response.data.data);
                        break;
                    case 'technicians':
                        setTechnicianStats(response.data.data);
                        break;
                    case 'clients':
                        setClientStats(response.data.data);
                        break;
                }
            }
            setError('');
        } catch (err) {
            console.error('Error fetching report data:', err);
            setError('Error al cargar datos del reporte');
        } finally {
            setLoading(false);
        }
    };

    const handleExportReport = async () => {
        try {
            const response = await axiosInstance.get('/reports/export', {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                    type: reportType
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${reportType}_${startDate}_${endDate}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Error exporting report:', err);
            setError('Error al exportar reporte');
        }
    };

    const renderEventChart = () => (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={eventStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alarms" stroke="#ef4444" name="Alarmas" />
                <Line type="monotone" dataKey="troubles" stroke="#f59e0b" name="Fallas" />
                <Line type="monotone" dataKey="supervisory" stroke="#3b82f6" name="Supervisión" />
            </LineChart>
        </ResponsiveContainer>
    );

    const renderTechnicianChart = () => (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={technicianStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="technician_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed_services" fill="#3b82f6" name="Servicios Completados" />
                <Bar dataKey="satisfaction_rate" fill="#10b981" name="Satisfacción" />
            </BarChart>
        </ResponsiveContainer>
    );

    const renderClientChart = () => (
        <ResponsiveContainer width="100%" height={400}>
            <PieChart>
                <Pie
                    data={clientStats}
                    dataKey="total_events"
                    nameKey="client_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#3b82f6"
                    label
                />
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reportes y Estadísticas
                </h2>
                <div className="flex space-x-4">
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as any)}
                        className="input"
                    >
                        <option value="events">Eventos</option>
                        <option value="technicians">Técnicos</option>
                        <option value="clients">Clientes</option>
                    </select>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="input"
                    >
                        <option value="week">Última Semana</option>
                        <option value="month">Este Mes</option>
                        <option value="custom">Personalizado</option>
                    </select>
                    {dateRange === 'custom' && (
                        <div className="flex space-x-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input"
                            />
                        </div>
                    )}
                    <button
                        onClick={handleExportReport}
                        className="btn btn-secondary"
                    >
                        <DocumentDownloadIcon className="h-5 w-5 mr-2" />
                        Exportar
                    </button>
                    <button
                        onClick={fetchReportData}
                        className="btn btn-primary"
                    >
                        <RefreshIcon className="h-5 w-5 mr-2" />
                        Actualizar
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {reportType === 'events' && renderEventChart()}
                        {reportType === 'technicians' && renderTechnicianChart()}
                        {reportType === 'clients' && renderClientChart()}
                    </>
                )}
            </div>

            {/* Tabla de datos detallados */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Datos Detallados
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    {/* Tabla específica según el tipo de reporte */}
                </div>
            </div>
        </div>
    );
} 