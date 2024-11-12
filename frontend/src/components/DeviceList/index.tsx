// frontend/src/components/DeviceList/index.tsx
import { FC, useEffect, useState } from 'react';
import { Device } from '@/types/models';
import { ApiResponse } from '@/types/api';

interface DeviceListProps {
  clientId?: number;
  onDeviceSelect?: (device: Device) => void;
}

const DeviceList: FC<DeviceListProps> = ({ clientId, onDeviceSelect }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/devices${clientId ? `?clientId=${clientId}` : ''}`);
        const data: ApiResponse<Device[]> = await response.json();
        setDevices(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [clientId]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {devices.map((device) => (
        <div
          key={device.id}
          className="p-4 border rounded-lg shadow hover:shadow-md cursor-pointer"
          onClick={() => onDeviceSelect?.(device)}
        >
          <h3 className="font-bold">{device.name}</h3>
          <p className="text-sm text-gray-600">{device.type}</p>
          <span className={`px-2 py-1 rounded-full text-xs ${
            device.status === 'active' ? 'bg-green-100 text-green-800' :
            device.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
            'bg-red-100 text-red-800'
          }`}>
            {device.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default DeviceList;