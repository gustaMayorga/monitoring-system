// src/types/dashboard.ts
export interface DashboardStats {
    camerasCount: number;
    alarmsCount: number;
    alertsCount: number;
    lastUpdated: string;
  }
  
  export interface Camera {
    id: number;
    name: string;
    location: string;
    status: 'active' | 'inactive' | 'error';
    lastSeen: string;
    type: string;
  }
  
  export interface Alarm {
    id: number;
    name: string;
    location: string;
    status: 'armed' | 'disarmed' | 'triggered';
    lastEvent: string;
    type: string;
  }
  
  export interface Alert {
    id: number;
    type: 'camera' | 'alarm';
    deviceId: number;
    deviceName: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    status: 'new' | 'acknowledged' | 'resolved';
  }