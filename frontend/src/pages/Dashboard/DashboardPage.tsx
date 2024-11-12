import React, { useState, useEffect } from 'react';
import { Activity, Camera, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

interface Stats {
  totalDevices: number;
  activeCameras: number;
  pendingAlerts: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalDevices: 0,
    activeCameras: 0,
    pendingAlerts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulamos datos para demostración
    setTimeout(() => {
      setStats({
        totalDevices: 5,
        activeCameras: 3,
        pendingAlerts: 2,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dispositivos Activos
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDevices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cámaras Activas
            </CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCameras}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Pendientes
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista General del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Bienvenido al sistema de monitoreo. Desde aquí puedes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Monitorear el estado de los dispositivos</li>
              <li>Ver las cámaras en tiempo real</li>
              <li>Gestionar las alertas del sistema</li>
              <li>Configurar las preferencias de monitoreo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}