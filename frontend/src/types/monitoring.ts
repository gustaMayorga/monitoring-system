export type EventPriority = 'low' | 'medium' | 'high' | 'critical';
export type EventStatus = 'new' | 'acknowledged' | 'processing' | 'resolved';
export type DeviceType = 'camera' | 'alarm' | 'sensor';
export type Protocol = 'CID' | 'SIA';

export interface MonitoringEvent {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  eventType: string;
  priority: EventPriority;
  status: EventStatus;
  description: string;
  rawData?: string;
  processed: boolean;
  metadata?: Record<string, any>;
}

export interface CameraEvent extends MonitoringEvent {
  deviceType: 'camera';
  imageUrl?: string;
  detectionType?: 'motion' | 'person' | 'vehicle' | 'object';
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AlarmEvent extends MonitoringEvent {
  deviceType: 'alarm';
  protocol: Protocol;
  zone?: string;
  user?: string;
  eventCode?: string;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: 'online' | 'offline' | 'warning';
  location: string;
  protocol?: Protocol;
  configuration: Record<string, any>;
  lastUpdate: string;
}