// src/services/cameraService.ts
import api from './api';

export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  streamUrl: string;
  lastEvent?: string;
}

export const cameraService = {
  getCameras: () => api.get<Camera[]>('/cameras'),
  getCamera: (id: string) => api.get<Camera>(`/cameras/${id}`),
  startRecording: (id: string) => api.post(`/cameras/${id}/record`),
  stopRecording: (id: string) => api.post(`/cameras/${id}/stop-record`),
  getStream: (id: string) => api.get(`/cameras/${id}/stream`)
};