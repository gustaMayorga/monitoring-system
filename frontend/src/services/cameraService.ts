import axios from 'axios';
import { Camera } from '../types/camera';
import { CameraAdapter } from './cameraAdapter';

export class CameraService {
    private baseUrl: string;

    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    async getCameras(): Promise<Camera[]> {
        const response = await axios.get(`${this.baseUrl}/cameras`);
        return response.data.data;
    }

    async getCamera(id: number): Promise<Camera> {
        const response = await axios.get(`${this.baseUrl}/cameras/${id}`);
        return response.data.data;
    }

    async createCamera(camera: Omit<Camera, 'id'>): Promise<Camera> {
        const response = await axios.post(`${this.baseUrl}/cameras`, camera);
        return response.data.data;
    }

    async updateCamera(id: number, camera: Partial<Camera>): Promise<Camera> {
        const response = await axios.put(`${this.baseUrl}/cameras/${id}`, camera);
        return response.data.data;
    }

    async deleteCamera(id: number): Promise<void> {
        await axios.delete(`${this.baseUrl}/cameras/${id}`);
    }

    async testConnection(camera: Camera): Promise<boolean> {
        try {
            const adapter = new CameraAdapter({
                ...camera.config,
                type: camera.type
            });
            await adapter.getDeviceInfo();
            return true;
        } catch (error) {
            return false;
        }
    }

    async startRecording(cameraId: number): Promise<void> {
        await axios.post(`${this.baseUrl}/cameras/${cameraId}/recording/start`);
    }

    async stopRecording(cameraId: number): Promise<void> {
        await axios.post(`${this.baseUrl}/cameras/${cameraId}/recording/stop`);
    }

    async getRecordings(cameraId: number, startDate: Date, endDate: Date): Promise<any[]> {
        const response = await axios.get(`${this.baseUrl}/cameras/${cameraId}/recordings`, {
            params: {
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            }
        });
        return response.data.data;
    }
} 