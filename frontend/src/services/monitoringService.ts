import axios from 'axios';
import { API_URL } from '../config';

export interface MonitoringEvent {
  id: number;
  session_id: number;
  device_id: number;
  timestamp: string;
  event_type: string;
  severity: string;
  data: any;
  processed: boolean;
}

export interface MonitoringSession {
  id: number;
  device_id: number;
  start_time: string;
  end_time: string | null;
  status: string;
  connection_info: any;
}

class MonitoringService {
  private baseUrl = API_URL;
  private socket: WebSocket | null = null;
  private eventHandlers: ((event: any) => void)[] = [];

  constructor() {
    this.setupAuthInterceptor();
  }

  private setupAuthInterceptor() {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Eventos y Alertas
  async getEvents(params: { skip?: number; limit?: number; status?: string; priority?: string } = {}) {
    const response = await axios.get(`${this.baseUrl}/events/`, { params });
    return response.data;
  }

  async acknowledgeEvent(eventId: number) {
    const response = await axios.post(`${this.baseUrl}/events/${eventId}/acknowledge`);
    return response.data;
  }

  // Cámaras
  getCameraStreamUrl(cameraId: string) {
    return `${this.baseUrl}/stream/${cameraId}`;
  }

  connectToCameraWebSocket(cameraId: string, onEvent: (event: any) => void) {
    const wsUrl = `ws://${window.location.hostname}:8000/ws/camera/${cameraId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }

  // Alarmas
  connectToAlarmWebSocket(onEvent: (event: any) => void) {
    const wsUrl = `ws://${window.location.hostname}:8000/ws/events`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    return () => {
      ws.close();
    };
  }

  async getAlarmEvents(params: { skip?: number; limit?: number } = {}) {
    const response = await axios.get(`${this.baseUrl}/events/`, { params });
    return response.data;
  }
}

export default new MonitoringService();