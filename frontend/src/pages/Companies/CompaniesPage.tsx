import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function CompaniesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Empresas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Administración de empresas</p>
        </CardContent>
      </Card>
    </div>
  );
}