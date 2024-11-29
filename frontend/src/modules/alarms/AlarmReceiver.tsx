import React, { useState, useEffect } from 'react';
import { parseContactID, parseSIA } from '../../utils/alarmParsers';

interface AlarmEvent {
    id: string;
    timestamp: Date;
    protocol: 'CID' | 'SIA';
    rawData: string;
    parsedData: {
        accountNumber: string;
        eventCode: string;
        eventDescription: string;
        zone: string;
        partition: string;
    };
    status: 'new' | 'processing' | 'verified' | 'false' | 'resolved';
    priority: 'high' | 'medium' | 'low';
    verificationStatus?: {
        cameraVerified?: boolean;
        aiVerified?: boolean;
        operatorVerified?: boolean;
    };
}

export default function AlarmReceiver() {
    const [activeAlarms, setActiveAlarms] = useState<AlarmEvent[]>([]);
    const [filteredAlarms, setFilteredAlarms] = useState<AlarmEvent[]>([]);
    const [statistics, setStatistics] = useState({
        totalAlarms: 0,
        falseAlarms: 0,
        verifiedAlarms: 0,
        pendingVerification: 0
    });

    // Simulación de recepción de alarmas (esto se reemplazará con WebSocket)
    useEffect(() => {
        const ws = new WebSocket('ws://your-backend-url/alarms');
        
        ws.onmessage = (event) => {
            const alarmData = JSON.parse(event.data);
            processNewAlarm(alarmData);
        };

        return () => ws.close();
    }, []);

    const processNewAlarm = async (rawAlarm: any) => {
        let parsedAlarm;
        
        if (rawAlarm.protocol === 'CID') {
            parsedAlarm = parseContactID(rawAlarm.data);
        } else if (rawAlarm.protocol === 'SIA') {
            parsedAlarm = parseSIA(rawAlarm.data);
        }

        // Verificación con cámaras si está disponible
        if (parsedAlarm.requiresVideoVerification) {
            const videoVerification = await requestVideoVerification(parsedAlarm.accountNumber);
            parsedAlarm.verificationStatus = {
                ...parsedAlarm.verificationStatus,
                cameraVerified: videoVerification.verified,
                aiVerified: videoVerification.aiAnalysis.humanDetected
            };
        }

        setActiveAlarms(prev => [...prev, parsedAlarm]);
    };

    return (
        <div className="flex flex-col space-y-6">
            {/* Panel de Estadísticas */}
            <div className="grid grid-cols-4 gap-4">
                <StatCard
                    title="Alarmas Activas"
                    value={statistics.totalAlarms}
                    trend="+5%"
                    status="warning"
                />
                <StatCard
                    title="Falsas Alarmas"
                    value={statistics.falseAlarms}
                    trend="-2%"
                    status="success"
                />
                <StatCard
                    title="Alarmas Verificadas"
                    value={statistics.verifiedAlarms}
                    trend="+8%"
                    status="info"
                />
                <StatCard
                    title="Pendientes de Verificación"
                    value={statistics.pendingVerification}
                    trend="+3%"
                    status="danger"
                />
            </div>

            {/* Lista de Alarmas Activas */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Alarmas Activas
                    </h3>
                    <div className="mt-4">
                        <AlarmList
                            alarms={filteredAlarms}
                            onAlarmAction={handleAlarmAction}
                        />
                    </div>
                </div>
            </div>

            {/* Mapa de Eventos */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Distribución de Eventos
                    </h3>
                    <div className="mt-4 h-96">
                        <AlarmMap events={activeAlarms} />
                    </div>
                </div>
            </div>
        </div>
    );
} 