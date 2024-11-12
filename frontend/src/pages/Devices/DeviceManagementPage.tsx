import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Device {
  id: string;
  name: string;
  type: 'camera' | 'alarm' | 'sensor';
  protocol?: 'CID' | 'SIA';
  status: 'online' | 'offline' | 'warning';
  location: string;
  lastEvent?: {
    type: string;
    timestamp: string;
  };
}

export default function DeviceManagementPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'alarm',
    protocol: 'CID',
    location: '',
  });

  // Cargar dispositivos
  useEffect(() => {
    const loadDevices = async () => {
      try {
        // Aquí conectarías con tu API
        const response = await fetch('/api/devices');
        const data = await response.json();
        setDevices(data);
      } catch (error) {
        console.error('Error loading devices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Aquí conectarías con tu API
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setIsAddingDevice(false);
        // Recargar dispositivos
      }
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestión de Dispositivos</h2>
        <Button onClick={() => setIsAddingDevice(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Dispositivo
        </Button>
      </div>

      {/* Tabla de dispositivos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Protocolo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Último Evento</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.name}</TableCell>
                <TableCell>{device.type}</TableCell>
                <TableCell>{device.protocol}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      device.status === 'online' ? 'success' :
                      device.status === 'warning' ? 'warning' : 'destructive'
                    }
                  >
                    {device.status}
                  </Badge>
                </TableCell>
                <TableCell>{device.location}</TableCell>
                <TableCell>
                  {device.lastEvent ? (
                    <div className="text-sm">
                      <div>{device.lastEvent.type}</div>
                      <div className="text-gray-500">
                        {new Date(device.lastEvent.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    'Sin eventos'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedDevice(device)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de agregar/editar dispositivo */}
      <Dialog open={isAddingDevice} onOpenChange={setIsAddingDevice}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedDevice ? 'Editar Dispositivo' : 'Agregar Dispositivo'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alarm">Alarma</SelectItem>
                  <SelectItem value="camera">Cámara</SelectItem>
                  <SelectItem value="sensor">Sensor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'alarm' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Protocolo</label>
                <Select
                  value={formData.protocol}
                  onValueChange={(value) => setFormData({...formData, protocol: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar protocolo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CID">Contact ID</SelectItem>
                    <SelectItem value="SIA">SIA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Ubicación</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsAddingDevice(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {selectedDevice ? 'Actualizar' : 'Agregar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}