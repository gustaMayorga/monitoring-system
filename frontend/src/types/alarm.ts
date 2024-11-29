export type AlarmProtocol = 'contact-id' | 'sia' | 'ademco' | 'other';
export type AlarmStatus = 'online' | 'offline' | 'trouble';

export interface AlarmPanel {
  id: number;
  name: string;
  ip: string;
  port: number;
  username: string;
  password: string;
  notes?: string;
  protocol: AlarmProtocol;
  status: AlarmStatus;
}

export interface AlarmEvent {
  id: number;
  panel_id: number;
  event_code: string;
  event_type: string;
  zone?: number;
  partition?: number;
  timestamp: Date;
  description: string;
} 