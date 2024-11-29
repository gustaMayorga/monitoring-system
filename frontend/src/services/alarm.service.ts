// src/services/alarmService.ts
import api from './api';

export interface Alarm {
  id: string;
  type: string;
  zone: string;
  status: 'active' | 'inactive';
  lastEvent: string;
}

export const alarmService = {
  getAlarms: () => api.get<Alarm[]>('/alarms'),
  getAlarmEvents: (id: string) => api.get(`/alarms/${id}/events`),
  acknowledgeAlarm: (id: string) => api.post(`/alarms/${id}/acknowledge`)
};