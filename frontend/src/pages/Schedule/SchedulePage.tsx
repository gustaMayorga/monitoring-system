import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui';

const SchedulePage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agenda</h1>
      <Card>
        <CardHeader>
          <CardTitle>Calendario</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Gestión de agenda</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchedulePage;