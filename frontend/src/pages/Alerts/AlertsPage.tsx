import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

const AlertsPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Alertas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sistema de Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Monitoreo de alertas</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsPage;