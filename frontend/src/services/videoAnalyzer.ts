export type DetectionResult = {
  type: 'motion' | 'person' | 'vehicle' | 'face' | 'object';
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: {
    class?: string;
    attributes?: Record<string, any>;
    trackingId?: string;
  };
};

export interface AnalysisConfig {
  enableMotionDetection: boolean;
  motionSensitivity: number;
  enableObjectDetection: boolean;
  objectClasses: string[];
  minConfidence: number;
  regions?: {
    name: string;
    points: { x: number; y: number }[];
    rules?: AnalysisRule[];
  }[];
}

export interface AnalysisRule {
  type: 'presence' | 'crossing' | 'loitering';
  objectTypes: string[];
  region?: string;
  duration?: number;
  direction?: 'in' | 'out' | 'both';
  schedule?: {
    days: number[];
    startTime: string;
    endTime: string;
  };
}

export class VideoAnalyzer {
  private config: AnalysisConfig;
  private worker: Worker | null = null;
  private activeDetections: Map<string, DetectionResult[]> = new Map();
  private eventCallbacks: ((event: any) => void)[] = [];

  constructor(config: AnalysisConfig) {
    this.config = config;
    this.initializeWorker();
  }

  private initializeWorker() {
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new Worker('/workers/video-analyzer.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);
      } catch (error) {
        console.error('Error initializing video analyzer worker:', error);
      }
    }
  }

  public async analyzeFrame(
    frameData: ImageData,
    timestamp: number,
    cameraId: string
  ): Promise<DetectionResult[]> {
    if (!this.worker) {
      throw new Error('Video analyzer worker not initialized');
    }

    return new Promise((resolve, reject) => {
      const messageId = `${cameraId}-${timestamp}`;
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Frame analysis timeout'));
      }, 5000);

      this.worker!.postMessage({
        type: 'analyzeFrame',
        frameData,
        config: this.config,
        messageId,
        timestamp,
        cameraId
      });

      const handleResponse = (event: MessageEvent) => {
        if (event.data.messageId === messageId) {
          clearTimeout(timeoutId);
          this.worker!.removeEventListener('message', handleResponse);
          resolve(event.data.detections);
        }
      };

      this.worker.addEventListener('message', handleResponse);
    });
  }

  private handleWorkerMessage(event: MessageEvent) {
    const { type, data } = event.data;

    switch (type) {
      case 'detection':
        this.handleDetection(data);
        break;
      case 'error':
        console.error('Video analyzer error:', data);
        break;
      case 'status':
        this.handleStatusUpdate(data);
        break;
    }
  }

  private handleDetection(detection: DetectionResult) {
    if (this.meetsRuleCriteria(detection)) {
      this.notifyEvent({
        type: 'detection',
        detection,
        timestamp: Date.now()
      });
    }
  }

  private meetsRuleCriteria(detection: DetectionResult): boolean {
    if (!this.config.regions) return true;

    return this.config.regions.some(region => {
      if (!region.rules) return false;

      return region.rules.some(rule => {
        if (!rule.objectTypes.includes(detection.type)) return false;

        switch (rule.type) {
          case 'presence':
            return this.checkPresence(detection, region);
          case 'crossing':
            return this.checkLineCrossing(detection, region);
          case 'loitering':
            return this.checkLoitering(detection, region);
          default:
            return false;
        }
      });
    });
  }

  private checkPresence(detection: DetectionResult, region: AnalysisConfig['regions'][0]): boolean {
    if (!detection.boundingBox) return false;
    return true; // Implementar lógica real de verificación
  }

  private checkLineCrossing(detection: DetectionResult, region: AnalysisConfig['regions'][0]): boolean {
    return false; // Implementar lógica real de verificación
  }

  private checkLoitering(detection: DetectionResult, region: AnalysisConfig['regions'][0]): boolean {
    return false; // Implementar lógica real de verificación
  }

  private handleStatusUpdate(status: any) {
    console.log('Video analyzer status:', status);
  }

  public onEvent(callback: (event: any) => void) {
    this.eventCallbacks.push(callback);
    return () => {
      const index = this.eventCallbacks.indexOf(callback);
      if (index > -1) {
        this.eventCallbacks.splice(index, 1);
      }
    };
  }

  private notifyEvent(event: any) {
    this.eventCallbacks.forEach(callback => callback(event));
  }

  public updateConfig(newConfig: Partial<AnalysisConfig>) {
    this.config = { ...this.config, ...newConfig };
    if (this.worker) {
      this.worker.postMessage({
        type: 'updateConfig',
        config: this.config
      });
    }
  }

  public destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.eventCallbacks = [];
  }
}

// Exporta una instancia por defecto si es necesario
export default VideoAnalyzer;