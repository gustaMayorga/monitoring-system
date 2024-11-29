import axios from 'axios';
import { digestAuth } from '../utils/digestAuth';
import { PTZParams } from '../types/camera';

export class HikvisionService {
    private baseUrl: string;
    private auth: {
        username: string;
        password: string;
    };

    constructor(ip: string, port: number, username: string, password: string) {
        this.baseUrl = `http://${ip}:${port}`;
        this.auth = { username, password };
    }

    async getStream(channel: number, streamType: 'main' | 'sub' = 'main'): Promise<string> {
        const path = `/ISAPI/Streaming/channels/${channel}${streamType === 'sub' ? '02' : '01'}`;
        await this.testConnection(path);
        return `rtsp://${this.auth.username}:${this.auth.password}@${this.baseUrl}${path}`;
    }

    async controlPTZ(params: PTZParams): Promise<void> {
        const { command, speed = 5, channel = 1 } = params;
        const path = `/ISAPI/PTZCtrl/channels/${channel}/continuous`;
        
        const ptzCommands = {
            up: { pan: 0, tilt: speed },
            down: { pan: 0, tilt: -speed },
            left: { pan: -speed, tilt: 0 },
            right: { pan: speed, tilt: 0 },
            stop: { pan: 0, tilt: 0 }
        };

        const data = {
            PTZData: {
                ...ptzCommands[command],
                zoom: 0
            }
        };

        await this.request('PUT', path, data);
    }

    async getSnapshot(channel: number): Promise<Blob> {
        const path = `/ISAPI/Streaming/channels/${channel}01/picture`;
        const response = await this.request('GET', path, null, 'blob');
        return response.data;
    }

    async getDeviceInfo(): Promise<any> {
        const path = '/ISAPI/System/deviceInfo';
        const response = await this.request('GET', path);
        return response.data;
    }

    private async testConnection(path: string): Promise<void> {
        try {
            await this.request('GET', path);
        } catch (error) {
            throw new Error('Failed to connect to camera');
        }
    }

    private async request(method: string, path: string, data?: any, responseType?: 'blob'): Promise<any> {
        const headers = await digestAuth(
            method,
            path,
            this.auth.username,
            this.auth.password
        );

        return axios({
            method,
            url: `${this.baseUrl}${path}`,
            headers,
            data,
            responseType
        });
    }
} 