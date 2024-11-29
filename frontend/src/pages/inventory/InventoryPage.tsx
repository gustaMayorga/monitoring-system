// src/pages/Inventory/InventoryPage.tsx
import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InventoryItem {
  id: number;
  code: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: 'available' | 'low' | 'out_of_stock';
}

const InventoryPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: 1,
      code: "CAM-001",
      name: "Cámara IP HD",
      category: "Cámaras",
      stock: 15,
      price: 299.99,
      status: "available"
    },
    {
      id: 2,
      code: "SNS-002",
      name: "Sensor de Movimiento",
      category: "Sensores",
      stock: 3,
      price: 45.99,
      status: "low"
    }
  ]);

  return (
    <div className="p-6">
      <div className="grid gap-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Total Items</div>
              <div className="text-2xl font-bold">156</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Bajo Stock</div>
              <div className="text-2xl font-bold text-yellow-600">8</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-gray-500">Sin Stock</div>
              <div className="text-2xl font-bold text-red-600">3</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de inventario */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Inventario</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline">Importar</Button>
              <Button>Nuevo Item</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4">
              <Input placeholder="Buscar por código o nombre..." className="max-w-sm"/>
              <select className="border rounded p-2">
                <option value="">Todas las categorías</option>
                <option value="cameras">Cámaras</option>
                <option value="sensors">Sensores</option>
                <option value="alarms">Alarmas</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Código</th>
                    <th className="text-left p-2">Nombre</th>
                    <th className="text-left p-2">Categoría</th>
                    <th className="text-right p-2">Stock</th>
                    <th className="text-right p-2">Precio</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.code}</td>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.category}</td>
                      <td className="p-2 text-right">{item.stock}</td>
                      <td className="p-2 text-right">${item.price}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          item.status === 'available' 
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'low'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2">
                        <Button variant="outline" size="sm" className="mr-2">
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm">
                          Eliminar
                        </Button>
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

export default InventoryPage;