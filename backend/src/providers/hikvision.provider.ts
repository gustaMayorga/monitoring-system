import { BaseCameraProvider, MotionEvent, LineCrossingEvent, FaceDetectionEvent } from './camera.provider';
import { Camera, PTZCommand } from '../types/camera';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

interface HikvisionDeviceInfo {
    DeviceInfo: {
        deviceName: string[];
        deviceID: string[];
        model: string[];
        serialNumber: string[];
        firmwareVersion: string[];
        firmwareReleasedDate: string[];
    };
}

interface HikvisionStreamInfo {
    StreamingChannel: {
        id: string[];
        channelName: string[];
        enabled: string[];
        sourceInputPort: string[];
        videoCodecType: string[];
        videoResolutionWidth: string[];
        videoResolutionHeight: string[];
        videoQualityControlType: string[];
        constantBitRate: string[];
        fixedQuality: string[];
        maxFrameRate: string[];
        keyFrameInterval: string[];
    };
}

export class HikvisionProvider extends BaseCameraProvider {
    private baseUrl: string;
    private auth: { username: string; password: string };
    private streamUrl?: string;
    private alarmStream?: any; // Tipo específico del SDK de Hikvision

    constructor(camera: Camera) {
        super(camera);
        this.baseUrl = `http://${camera.ip_address}`;
        this.auth = {
            username: camera.username!,
            password: camera.password!
        };
    }

    async connect(): Promise<void> {
        try {
            const deviceInfo = await this.getDeviceInfo();
            console.log('Connected to Hikvision camera:', deviceInfo);
            await this.startAlarmStream();
            await this.configureMotionDetection();
        } catch (error) {
            console.error('Error connecting to Hikvision camera:', error);
            throw error;
        }
    }

    private async getDeviceInfo(): Promise<HikvisionDeviceInfo> {
        const response = await axios.get(`${this.baseUrl}/ISAPI/System/deviceInfo`, {
            auth: this.auth
        });
        return parseStringPromise(response.data);
    }

    private async configureMotionDetection(): Promise<void> {
        // Configurar detección de movimiento
        await axios.put(
            `${this.baseUrl}/ISAPI/System/Video/inputs/channels/1/motionDetection`,
            {
                MotionDetection: {
                    enabled: true,
                    sensitivityLevel: 60,
                    detectionThreshold: 50,
                    regionType: 'grid',
                    Grid: {
                        rowGranularity: 18,
                        columnGranularity: 22
                    }
                }
            },
            { auth: this.auth }
        );
    }

    private async startAlarmStream(): Promise<void> {
        // Implementar la conexión al stream de alarmas
        // Esto dependerá del SDK específico de Hikvision
    }

    async getStreamUrl(): Promise<string> {
        if (!this.streamUrl) {
            const response = await axios.get<HikvisionStreamInfo>(
                `${this.baseUrl}/ISAPI/Streaming/channels/101`,
                { auth: this.auth }
            );
            const data = await parseStringPromise(response.data);
            this.streamUrl = `rtsp://${this.auth.username}:${this.auth.password}@${this.camera.ip_address}:554/Streaming/Channels/101`;
        }
        return this.streamUrl;
    }

    async getSnapshot(): Promise<Buffer> {
        const response = await axios.get(
            `${this.baseUrl}/ISAPI/Streaming/channels/101/picture`,
            {
                auth: this.auth,
                responseType: 'arraybuffer'
            }
        );
        return Buffer.from(response.data);
    }

    async controlPTZ(command: PTZCommand, speed: number = 1): Promise<void> {
        const ptzCommands: Record<PTZCommand, string> = {
            up: 'tilt-up',
            down: 'tilt-down',
            left: 'pan-left',
            right: 'pan-right',
            zoomIn: 'zoom-in',
            zoomOut: 'zoom-out',
            stop: 'stop'
        };

        await axios.put(
            `${this.baseUrl}/ISAPI/PTZCtrl/channels/1/continuous`,
            {
                PTZData: {
                    pan: command.includes('left') ? -speed : command.includes('right') ? speed : 0,
                    tilt: command.includes('up') ? speed : command.includes('down') ? -speed : 0,
                    zoom: command.includes('zoom') ? (command.includes('In') ? speed : -speed) : 0
                }
            },
            { auth: this.auth }
        );
    }

    async disconnect(): Promise<void> {
        if (this.alarmStream) {
            await this.alarmStream.close();
        }
    }
} 