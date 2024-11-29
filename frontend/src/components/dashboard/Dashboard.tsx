import React, { useEffect, useState } from 'react';
import { EventsChart } from './EventsChart';
import { StatsWidget } from './StatsWidget';
import { Event } from '../../types/event';
import { Camera } from '../../types/camera';
import { Client } from '../../types/client';
import api from '../../utils/api';
import { EventDetails } from '../events/EventDetails';

interface DashboardStats {
    cameras: {
        name: string;
        value: number;
        change: number;
        changeType: 'increase' | 'decrease';
    };
    alerts: {
        name: string;
        value: number;
        change: number;
        changeType: 'increase' | 'decrease';
    };
    clients: {
        name: string;
        value: number;
        change: number;
        changeType?: 'increase' | 'decrease';
    };
    uptime: {
        name: string;
        value: number;
        change: number;
        changeType: 'increase' | 'decrease';
    };
}

export const Dashboard: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [eventsRes, camerasRes, clientsRes] = await Promise.all([
                api.get<{ data: Event[] }>('/events'),
                api.get<{ data: Camera[] }>('/cameras'),
                api.get<{ data: Client[] }>('/clients')
            ]);

            setEvents(eventsRes.data.data);
            setCameras(camerasRes.data.data);
            setClients(clientsRes.data.data);
        } catch (err) {
            setError('Error al cargar los datos del dashboard');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const stats: DashboardStats = {
        cameras: {
            name: 'Cámaras Activas',
            value: cameras.filter(c => c.status === 'active').length,
            change: 5,
            changeType: 'increase'
        },
        alerts: {
            name: 'Eventos Hoy',
            value: events.filter(e => 
                new Date(e.occurred_at).toDateString() === new Date().toDateString()
            ).length,
            change: -2,
            changeType: 'decrease'
        },
        clients: {
            name: 'Clientes Activos',
            value: clients.filter(c => c.status === 'active').length,
            change: 0,
            changeType: 'increase'
        },
        uptime: {
            name: 'Uptime',
            value: 99.9,
            change: 0.1,
            changeType: 'increase'
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <StatsWidget stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <EventsChart events={events} />
                </div>
            </div>

            {selectedEvent && (
                <EventDetails 
                    event={selectedEvent}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedEvent(null);
                    }}
                />
            )}
        </div>
    );
}; 