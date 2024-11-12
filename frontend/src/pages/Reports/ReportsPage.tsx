import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informes del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Visualización de reportes</p>
        </CardContent>
      </Card>
    </div>
  );
}