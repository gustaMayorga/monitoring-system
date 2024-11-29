import { Client } from './client';

export type CameraVendor = 'hikvision' | 'dahua' | 'axis' | 'generic';
export type StreamProtocol = 'rtsp' | 'rtmp' | 'webrtc' | 'hls';
export type PTZCommand = 'up' | 'down' | 'left' | 'right' | 'zoomIn' | 'zoomOut' | 'stop';
export type CameraStatus = 'active' | 'inactive' | 'error';

export interface Camera {
    id: number;
    name: string;
    location: string;
    description?: string;
    model?: string;
    vendor: CameraVendor;
    ip_address: string;
    port: number;
    username?: string;
    password?: string;
    stream_url: string;
    status: CameraStatus;
    last_seen?: Date;
    created_at: Date;
    updated_at: Date;
    client_id?: number;
    client?: Client;
    config?: CameraConfig;
}

export interface CameraConfig {
    stream: {
        protocol: StreamProtocol;
        mainStream: string;
        subStream?: string;
        quality?: 'high' | 'medium' | 'low';
    };
    ptz?: {
        enabled: boolean;
        supportsPresets: boolean;
        supportsPatrol: boolean;
        supportsContinuous: boolean;
    };
    ai?: {
        faceDetection?: boolean;
        objectDetection?: boolean;
        lineDetection?: boolean;
        motionDetection?: boolean;
        features?: string[];
    };
    recording?: {
        enabled: boolean;
        schedule?: RecordingSchedule[];
        retention: number; // días
        storage: 'local' | 's3' | 'nfs';
    };
}

export interface RecordingSchedule {
    dayOfWeek: number; // 0-6 (domingo-sábado)
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    type: 'continuous' | 'motion' | 'event';
}

export interface PTZPreset {
    id: number;
    name: string;
    position: {
        pan: number;
        tilt: number;
        zoom: number;
    };
}

export interface CreateCameraDTO {
    name: string;
    location: string;
    ip_address: string;
    port: number;
    stream_url: string;
    vendor: CameraVendor;
    client_id: number;
    status?: CameraStatus;
    username?: string;
    password?: string;
}

export interface UpdateCameraDTO extends Partial<CreateCameraDTO> {
    status?: CameraStatus;
}

export interface DbCamera {
    id?: number;
    name: string;
    location: string;
    ip_address: string;
    port: number;
    stream_url: string;
    vendor: CameraVendor;
    client_id: number;
    status: CameraStatus;
    username?: string;
    password?: string;
    created_at?: Date;
    updated_at?: Date;
} 