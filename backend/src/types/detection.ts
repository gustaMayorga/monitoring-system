export interface Detection {
    type: DetectionType;
    confidence: number;
    bbox: BoundingBox;
    timestamp: Date;
    metadata?: Record<string, any>;
}

export type DetectionType = 
    | 'person'
    | 'vehicle'
    | 'face'
    | 'object'
    | 'motion'
    | 'crossing';

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface DetectionConfig {
    enabled: boolean;
    types: DetectionType[];
    minConfidence: number;
    interval: number;
    regions?: DetectionRegion[];
}

export interface DetectionRegion {
    id: string;
    name: string;
    points: Point[];
    type: 'include' | 'exclude';
}

export interface Point {
    x: number;
    y: number;
} 