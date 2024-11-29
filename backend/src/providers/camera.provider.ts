import { EventEmitter } from 'events';
import { Camera, PTZCommand } from '../types/camera';

export interface CameraEvent {
    timestamp: Date;
    type: string;
    data: any;
}

export interface MotionEvent extends CameraEvent {
    type: 'motion';
    data: {
        region: string;
        confidence: number;
        snapshot?: string;
    };
}

export interface LineCrossingEvent extends CameraEvent {
    type: 'lineCrossing';
    data: {
        direction: 'in' | 'out';
        line: string;
        snapshot?: string;
    };
}

export interface FaceDetectionEvent extends CameraEvent {
    type: 'faceDetected';
    data: {
        confidence: number;
        bbox: [number, number, number, number]; // [x, y, width, height]
        snapshot?: string;
        features?: Record<string, number>;
    };
}

export interface CameraProvider {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getStreamUrl(): Promise<string>;
    getSnapshot(): Promise<Buffer>;
    controlPTZ(command: PTZCommand, speed?: number): Promise<void>;
    on(event: 'motion', listener: (event: MotionEvent) => void): this;
    on(event: 'lineCrossing', listener: (event: LineCrossingEvent) => void): this;
    on(event: 'faceDetected', listener: (event: FaceDetectionEvent) => void): this;
    on(event: string, listener: (event: CameraEvent) => void): this;
}

export abstract class BaseCameraProvider extends EventEmitter implements CameraProvider {
    constructor(protected camera: Camera) {
        super();
    }

    abstract connect(): Promise<void>;
    abstract disconnect(): Promise<void>;
    abstract getStreamUrl(): Promise<string>;
    abstract getSnapshot(): Promise<Buffer>;
    abstract controlPTZ(command: PTZCommand, speed?: number): Promise<void>;

    protected emitEvent(event: CameraEvent) {
        this.emit(event.type, event);
    }
} 