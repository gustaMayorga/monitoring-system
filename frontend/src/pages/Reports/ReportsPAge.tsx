// src/pages/Reports/ReportsPage.tsx
import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Report {
  id: number;
  title: string;
  type: 'alarm' | 'camera' | 'maintenance' | 'inventory';
  date: string;
  status: 'generated' | 'pending' | 'failed';
  createdBy: string;
  downloadUrl?: string;
}

const ReportsPage = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: "Reporte de Alarmas - Octubre 2024",
      type: "alarm",
      date: "2024-11-01",
      status: "generated",
      createdBy: "Admin",
      downloadUrl: "#"
    }
  ]);

  return (
    <div className="p-6">
      <div className="grid gap-6">
        {/* Generación de Reportes */}
        <Card>
          <CardHeader>
            <CardTitle>Generar Nuevo Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium mb-2">Eventos de Alarmas</h3>
                <Button variant="outline" className="w-full">
                  Generar Reporte de Alarmas
                </Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Análisis de Cámaras</h3>
                <Button variant="outline" className="w-full">
                  Generar Reporte de Cámaras
                </Button>
              </div>
              <div>
                <h3 className="font-medium mb-2">Mantenimientos</h3>
                <Button variant="outline" className="w-full">
                  Generar Reporte de Mantenimiento
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Reportes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Reportes Generados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Título</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Creado por</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b">
                      <td className="p-2">{report.title}</td>
                      <td className="p-2">
                        <span className="capitalize">{report.type}</span>
                      </td>
                      <td className="p-2">
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          report.status === 'generated' 
                            ? 'bg-green-100 text-green-800'
                            : report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="p-2">{report.createdBy}</td>
                      <td className="p-2">
                        {report.status === 'generated' && (
                          <Button variant="outline" size="sm">
                            Descargar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;