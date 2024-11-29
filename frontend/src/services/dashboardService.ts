// src/services/dashboardService.ts
import api from './api';

export interface DashboardStats {
  totalCameras: number;
  activeCameras: number;
  totalAlerts: number;
  pendingAlerts: number;
  totalEvents: number;
  todayEvents: number;
  clientsCount: number;
}

export interface RecentEvent {
  id: string;
  type: 'camera' | 'alarm' | 'system';
  description: string;
  timestamp: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  severity: 'low' | 'medium' | 'high';
}

export const dashboardService = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getRecentEvents: () => api.get<RecentEvent[]>('/dashboard/events'),
  getActiveAlerts: () => api.get('/dashboard/alerts')
};