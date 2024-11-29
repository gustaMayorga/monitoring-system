import { HikvisionService, PTZParams } from './hikvision';
import { DahuaService } from './dahua';

export interface CameraConfig {
    ip: string;
    port: number;
    username: string;
    password: string;
    type: 'hikvision' | 'dahua';
}

export interface StreamOptions {
    channel: number;
    streamType?: 'main' | 'sub';
}

export interface ICameraService {
    getStream(options: StreamOptions): Promise<string>;
    controlPTZ(params: PTZParams): Promise<any>;
    getSnapshot(channel: number): Promise<Blob>;
    startRecording(channel: number): Promise<any>;
    stopRecording(channel: number): Promise<any>;
    getEvents(startTime: Date, endTime: Date): Promise<any>;
    getDeviceInfo(): Promise<any>;
}

export class CameraAdapter implements ICameraService {
    private service: HikvisionService | DahuaService;
    private type: 'hikvision' | 'dahua';

    constructor(config: CameraConfig) {
        this.type = config.type;
        
        if (config.type === 'hikvision') {
            this.service = new HikvisionService(
                config.ip,
                config.port,
                config.username,
                config.password
            );
        } else {
            this.service = new DahuaService(
                config.ip,
                config.port,
                config.username,
                config.password
            );
        }
    }

    async getStream({ channel, streamType = 'main' }: StreamOptions): Promise<string> {
        return this.service.getStream(channel, streamType);
    }

    async controlPTZ(params: PTZParams): Promise<any> {
        return this.service.controlPTZ(params);
    }

    async getSnapshot(channel: number): Promise<Blob> {
        return this.service.getSnapshot(channel);
    }

    async startRecording(channel: number): Promise<any> {
        return this.service.startRecording(channel);
    }

    async stopRecording(channel: number): Promise<any> {
        return this.service.stopRecording(channel);
    }

    async getEvents(startTime: Date, endTime: Date): Promise<any> {
        return this.service.getEvents(startTime, endTime);
    }

    async getDeviceInfo(): Promise<any> {
        return this.service.getDeviceInfo();
    }
} 