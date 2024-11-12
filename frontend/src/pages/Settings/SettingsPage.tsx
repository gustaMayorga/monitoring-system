import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Ajustes generales del sistema</p>
        </CardContent>
      </Card>
    </div>
  );
}