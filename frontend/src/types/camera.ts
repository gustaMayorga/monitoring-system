import { Client } from './client';

export interface Camera {
    id: number;
    name: string;
    location: string;
    vendor: string;
    ip_address: string;
    port: number;
    stream_url: string;
    status: CameraStatus;
    type: CameraType;
    config: CameraConfig;
    created_at: Date;
    updated_at: Date;
    client_id?: number;
    client?: Client;
}

export type CameraStatus = 'active' | 'inactive' | 'maintenance';
export type CameraType = 'hikvision' | 'dahua' | 'axis' | 'other';

export interface CameraConfig {
    username?: string;
    password?: string;
    rtsp_port?: number;
    http_port?: number;
    channel?: number;
    stream?: number;
    motion_detection?: boolean;
    recording?: boolean;
    [key: string]: any;
}

export interface CameraFormData {
    name: string;
    location: string;
    vendor: string;
    ip_address: string;
    port: number;
    username?: string;
    password?: string;
    type: CameraType;
    client_id?: number;
    stream_url: string;
}