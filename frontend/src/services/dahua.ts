import axios from 'axios';
import { PTZParams } from '../types/camera';

export class DahuaService {
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
        const path = `/cam/realmonitor?channel=${channel}&subtype=${streamType === 'sub' ? 1 : 0}`;
        await this.testConnection();
        return `rtsp://${this.auth.username}:${this.auth.password}@${this.baseUrl}${path}`;
    }

    async controlPTZ(params: PTZParams): Promise<void> {
        const { command, speed = 5, channel = 1 } = params;
        
        const ptzCommands = {
            up: 'Up',
            down: 'Down',
            left: 'Left',
            right: 'Right',
            stop: 'Stop'
        };

        const path = '/cgi-bin/ptz.cgi';
        const action = ptzCommands[command];
        
        await this.request('GET', path, {
            params: {
                action,
                channel,
                speed,
                username: this.auth.username,
                password: this.auth.password
            }
        });
    }

    async getSnapshot(channel: number): Promise<Blob> {
        const path = '/cgi-bin/snapshot.cgi';
        const response = await this.request('GET', path, {
            params: { channel },
            responseType: 'blob'
        });
        return response.data;
    }

    async getDeviceInfo(): Promise<any> {
        const path = '/cgi-bin/magicBox.cgi';
        const response = await this.request('GET', path, {
            params: { action: 'getSystemInfo' }
        });
        return response.data;
    }

    private async testConnection(): Promise<void> {
        try {
            await this.getDeviceInfo();
        } catch (error) {
            throw new Error('Failed to connect to camera');
        }
    }

    private request(method: string, path: string, config: any = {}): Promise<any> {
        return axios({
            method,
            url: `${this.baseUrl}${path}`,
            auth: this.auth,
            ...config
        });
    }
} 