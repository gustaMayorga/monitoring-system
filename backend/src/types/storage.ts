import { Camera } from './camera';

export interface StorageConfig {
    provider: 'local' | 's3';
    local?: {
        basePath: string;
    };
    s3?: {
        accessKeyId: string;
        secretAccessKey: string;
        bucket: string;
        region: string;
    };
}

export interface RecordingMetadata {
    id: number;
    camera_id: number;
    path: string;
    start_time: Date;
    end_time: Date;
    duration: number; // en segundos
    size: number; // en bytes
    format: string;
    status: RecordingStatus;
    created_at: Date;
    updated_at: Date;
    camera?: Camera;
}

export type RecordingStatus = 'recording' | 'completed' | 'failed' | 'deleted';

export interface RetentionPolicy {
    id: number;
    camera_id?: number; // null para política global
    days: number;
    deleteAfter: boolean;
    compress?: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface StorageQuota {
    id: number;
    client_id: number;
    maxSize: number; // en GB
    warningThreshold: number; // porcentaje
    action: QuotaAction;
    created_at: Date;
    updated_at: Date;
}

export type QuotaAction = 'notify' | 'stop_recording' | 'delete_oldest';

export interface StorageStats {
    usedSpace: number; // en bytes
    recordingsCount: number;
    oldestRecording?: Date;
    newestRecording?: Date;
    quotaPercentage?: number;
}

export interface SnapshotMetadata {
    id: number;
    camera_id: number;
    path: string;
    timestamp: Date;
    format: string;
    size: number;
    reason?: string;
    created_at: Date;
    updated_at: Date;
} 