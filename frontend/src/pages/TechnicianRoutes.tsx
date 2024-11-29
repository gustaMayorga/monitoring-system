import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corregir el problema de los íconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
});

interface Route {
    id: number;
    technician_id: number;
    technician_name: string;
    date: string;
    status: string;
    total_distance: number;
    total_time: number;
    stops: RouteStop[];
}

interface RouteStop {
    id: number;
    service_id: number;
    stop_number: number;
    estimated_arrival_time: string;
    actual_arrival_time?: string;
    estimated_duration: number;
    actual_duration?: number;
    location_lat: number;
    location_lon: number;
    status: string;
    client_name: string;
    service_type: string;
    address: string;
}

interface Technician {
    id: number;
    name: string;
    current_location_lat?: number;
    current_location_lon?: number;
    last_location_update?: string;
}

export default function TechnicianRoutes() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedTechnician, setSelectedTechnician] = useState<number | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showOptimizeModal, setShowOptimizeModal] = useState(false);
    const [optimizationResult, setOptimizationResult] = useState<any>(null);

    useEffect(() => {
        fetchRoutes();
        fetchTechnicians();
        const interval = setInterval(fetchRoutes, 60000); // Actualizar cada minuto
        return () => clearInterval(interval);
    }, [selectedDate, selectedTechnician]);

    const fetchRoutes = async () => {
        try {
            const response = await axiosInstance.get('/technician-routes', {
                params: {
                    date: selectedDate,
                    technician_id: selectedTechnician !== 'all' ? selectedTechnician : undefined
                }
            });
            if (response.data.status === 'success') {
                setRoutes(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching routes:', err);
            setError('Error al cargar rutas');
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await axiosInstance.get('/technicians');
            if (response.data.status === 'success') {
                setTechnicians(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching technicians:', err);
        }
    };

    const handleOptimizeRoute = async (technicianId: number) => {
        try {
            const response = await axiosInstance.post('/technician-routes/optimize', {
                technician_id: technicianId,
                date: selectedDate
            });
            if (response.data.status === 'success') {
                setOptimizationResult(response.data.data);
                fetchRoutes();
            }
        } catch (err) {
            console.error('Error optimizing route:', err);
            setError('Error al optimizar ruta');
        }
    };

    const handleCompleteStop = async (stopId: number, data: any) => {
        try {
            const response = await axiosInstance.post(`/technician-routes/stops/${stopId}/complete`, data);
            if (response.data.status === 'success') {
                fetchRoutes();
            }
        } catch (err) {
            console.error('Error completing stop:', err);
            setError('Error al completar parada');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rutas de Técnicos
                </h2>
                <div className="flex space-x-4">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input"
                    />
                    <select
                        value={selectedTechnician}
                        onChange={(e) => setSelectedTechnician(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="input"
                    >
                        <option value="all">Todos los técnicos</option>
                        {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                                {tech.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowOptimizeModal(true)}
                        className="btn btn-primary"
                    >
                        Optimizar Rutas
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Mapa */}
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="h-96">
                    <MapContainer
                        center={[-34.6037, -58.3816]} // Buenos Aires como ejemplo
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {routes.map((route) => (
                            route.stops.map((stop) => (
                                <Marker
                                    key={stop.id}
                                    position={[stop.location_lat, stop.location_lon]}
                                >
                                    <Popup>
                                        <div>
                                            <h3 className="font-medium">{stop.client_name}</h3>
                                            <p className="text-sm">{stop.service_type}</p>
                                            <p className="text-sm">{stop.address}</p>
                                            <p className="text-sm">
                                                {format(new Date(stop.estimated_arrival_time), 'HH:mm')}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))
                        ))}
                        {technicians.map((tech) => (
                            tech.current_location_lat && tech.current_location_lon && (
                                <Marker
                                    key={tech.id}
                                    position={[tech.current_location_lat, tech.current_location_lon]}
                                    icon={L.icon({
                                        iconUrl: '/technician-marker.png',
                                        iconSize: [32, 32],
                                        iconAnchor: [16, 32],
                                    })}
                                >
                                    <Popup>
                                        <div>
                                            <h3 className="font-medium">{tech.name}</h3>
                                            <p className="text-sm">
                                                Última actualización:
                                                {tech.last_location_update && 
                                                    format(new Date(tech.last_location_update), 'HH:mm')}
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Lista de rutas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {routes.map((route) => (
                    <div
                        key={route.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    {route.technician_name}
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {route.total_distance.toFixed(1)} km
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {Math.round(route.total_time)} min
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {route.stops.map((stop) => (
                                    <div
                                        key={stop.id}
                                        className={`flex items-start space-x-4 p-4 rounded-lg ${
                                            stop.status === 'completed'
                                                ? 'bg-green-50 dark:bg-green-900'
                                                : 'bg-gray-50 dark:bg-gray-700'
                                        }`}
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                            {stop.stop_number}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {stop.client_name}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {stop.service_type}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {stop.address}
                                            </p>
                                            <div className="mt-2 flex items-center space-x-4">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {format(new Date(stop.estimated_arrival_time), 'HH:mm')}
                                                </span>
                                                {stop.actual_arrival_time && (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        Llegada: {format(new Date(stop.actual_arrival_time), 'HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {stop.status !== 'completed' && (
                                            <button
                                                onClick={() => handleCompleteStop(stop.id, {
                                                    duration: stop.estimated_duration
                                                })}
                                                className="px-3 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                                            >
                                                Completar
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de optimización */}
            {showOptimizeModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                                Optimizar Rutas
                            </h3>
                            <div className="space-y-4">
                                {technicians.map((tech) => (
                                    <button
                                        key={tech.id}
                                        onClick={() => {
                                            handleOptimizeRoute(tech.id);
                                            setShowOptimizeModal(false);
                                        }}
                                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        {tech.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 