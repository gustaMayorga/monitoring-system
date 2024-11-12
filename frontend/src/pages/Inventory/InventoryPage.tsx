import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

export default function InventoryPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Inventario</h1>
      <Card>
        <CardHeader>
          <CardTitle>Control de Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Gestión de inventario</p>
        </CardContent>
      </Card>
    </div>
  );
}