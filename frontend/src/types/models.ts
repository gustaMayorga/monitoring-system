// frontend/src/types/models.ts
export interface User {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'user';
    isActive: boolean;
  }
  
  export interface Device {
    id: number;
    name: string;
    type: 'camera' | 'alarm';
    status: 'active' | 'inactive' | 'error';
    lastSeen?: Date;
    config: Record<string, unknown>;
  }
  
  export interface Client {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    devices: Device[];
    isActive: boolean;
  }