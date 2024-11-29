import React, { useMemo } from 'react';
import { Event } from '../../types/event';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface EventsChartProps {
    events: Event[];
    days?: number;
}

export const EventsChart: React.FC<EventsChartProps> = ({ events, days = 7 }) => {
    const data = useMemo(() => {
        const endDate = new Date();
        const startDate = subDays(endDate, days - 1);
        
        // Crear un array con todos los días en el rango
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
        
        // Inicializar los datos con 0 eventos para cada día
        const initialData = dateRange.map(date => ({
            date,
            total: 0,
            critical: 0,
            error: 0,
            warning: 0,
            info: 0
        }));

        // Contar eventos por día y severidad
        events.forEach(event => {
            const eventDate = new Date(event.occurred_at);
            if (eventDate >= startDate && eventDate <= endDate) {
                const dayIndex = initialData.findIndex(
                    d => d.date.toDateString() === eventDate.toDateString()
                );
                if (dayIndex !== -1) {
                    initialData[dayIndex].total++;
                    if (event.event_type?.severity) {
                        initialData[dayIndex][event.event_type.severity]++;
                    }
                }
            }
        });

        // Formatear fechas para el gráfico
        return initialData.map(day => ({
            ...day,
            date: format(day.date, 'dd MMM', { locale: es })
        }));
    }, [events, days]);

    const colors = {
        total: '#6B7280',
        critical: '#DC2626',
        error: '#F97316',
        warning: '#FBBF24',
        info: '#60A5FA'
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
                Eventos por Día
            </h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            tick={{ fontSize: 12 }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: 'none',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="total"
                            stroke={colors.total}
                            strokeWidth={2}
                            dot={false}
                            name="Total"
                        />
                        <Line
                            type="monotone"
                            dataKey="critical"
                            stroke={colors.critical}
                            strokeWidth={2}
                            dot={false}
                            name="Críticos"
                        />
                        <Line
                            type="monotone"
                            dataKey="error"
                            stroke={colors.error}
                            strokeWidth={2}
                            dot={false}
                            name="Errores"
                        />
                        <Line
                            type="monotone"
                            dataKey="warning"
                            stroke={colors.warning}
                            strokeWidth={2}
                            dot={false}
                            name="Advertencias"
                        />
                        <Line
                            type="monotone"
                            dataKey="info"
                            stroke={colors.info}
                            strokeWidth={2}
                            dot={false}
                            name="Info"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}; 