import { DetectionType, BoundingBox } from './detection';

export interface AIConfig {
    modelPath: string;
    confidenceThreshold: number;
    supportedTypes: DetectionType[];
    maxBatchSize: number;
    modelType: 'object' | 'face' | 'pose';
    deviceType: 'cpu' | 'gpu';
}

export interface AIDetection {
    type: DetectionType;
    confidence: number;
    bbox: BoundingBox;
    metadata?: {
        class_name?: string;
        track_id?: number;
        velocity?: {
            x: number;
            y: number;
        };
        attributes?: Record<string, any>;
    };
}

export interface ProcessingResult {
    detections: AIDetection[];
    processedAt: Date;
    processingTime: number;
    metadata?: Record<string, any>;
}

export interface AIProcessingOptions {
    minConfidence?: number;
    maxDetections?: number;
    regions?: {
        x: number;
        y: number;
        width: number;
        height: number;
    }[];
} 