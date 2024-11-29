export interface SystemEvent {
    id: number;
    type: 'CAMERA_OFFLINE' | 'CAMERA_ONLINE' | 'MOTION_DETECTED' | 'SYSTEM_ERROR';
    description: string;
    timestamp: string;
} 