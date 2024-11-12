import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HddIcon, CameraIcon, BellIcon } from 'lucide-react';

const Dashboard = () => {
  const [activeDevices, setActiveDevices] = useState(0);
  const [activeCameras, setActiveCameras] = useState(0);
  const [pendingAlerts, setPendingAlerts] = useState(0);

  useEffect(() => {
    // Fetch data from backend and update state
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setActiveDevices(data.activeDevices);
        setActiveCameras(data.activeCameras);
        setPendingAlerts(data.pendingAlerts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-3">
          <HddIcon size={32} />
          <div>
            <p className="text-2xl font-bold">{activeDevices}</p>
            <p className="text-gray-500">Active Devices</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <CameraIcon size={32} />
          <div>
            <p className="text-2xl font-bold">{activeCameras}</p>
            <p className="text-gray-500">Active Cameras</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <BellIcon size={32} />
          <div>
            <p className="text-2xl font-bold">{pendingAlerts}</p>
            <p className="text-gray-500">Pending Alerts</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;