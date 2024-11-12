import axios from 'axios';
import config from '@/config';

export interface Camera {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  rtsp_url?: string;
  location?: string;
  last_event?: {
    type: string;
    timestamp: string;
  };
}

export interface CameraEvent {
  id: string;
  camera_id: string;
  event_type: 'motion' | 'person' | 'object' | 'connection_lost';
  timestamp: string;
  data: any;
}

class CameraService {
  private baseUrl = config.API_URL;
  private eventHandlers: Map<string, ((event: any) => void)[]> = new Map();

  async getCameras(): Promise<Camera[]> {
    const response = await axios.get(`${this.baseUrl}/cameras/`);
    return response.data;
  }

  async getCameraById(id: string): Promise<Camera> {
    const response = await axios.get(`${this.baseUrl}/cameras/${id}`);
    return response.data;
  }

  async getCameraEvents(cameraId: string, params: { skip?: number; limit?: number } = {}): Promise<CameraEvent[]> {
    const response = await axios.get(`${this.baseUrl}/cameras/${cameraId}/events`, { params });
    return response.data;
  }

  getStreamUrl(cameraId: string): string {
    return `${this.baseUrl}/stream/${cameraId}`;
  }

  subscribeToCamera(cameraId: string, onEvent: (event: any) => void): () => void {
    const ws = new WebSocket(`${config.WS_URL}/ws/camera/${cameraId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onEvent(data);
    };

    // Almacenar el handler para limpieza
    if (!this.eventHandlers.has(cameraId)) {
      this.eventHandlers.set(cameraId, []);
    }
    this.eventHandlers.get(cameraId)?.push(onEvent);

    // Retornar función de limpieza
    return () => {
      ws.close();
      const handlers = this.eventHandlers.get(cameraId) || [];
      const index = handlers.indexOf(onEvent);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    };
  }
}

export default new CameraService();