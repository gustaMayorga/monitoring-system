// src/services/videoProcessor.ts
interface Detection {
    type: string;
    confidence: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }
  
  class VideoProcessor {
    private worker: Worker | null = null;
    private isProcessing: boolean = false;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
  
    constructor() {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d')!;
      this.initializeWorker();
    }
  
    private initializeWorker() {
      this.worker = new Worker('/video-worker.js');
      this.worker.onmessage = (event) => {
        const { detections } = event.data;
        this.handleDetections(detections);
      };
    }
  
    private handleDetections(detections: Detection[]) {
      // Emitir eventos para cada detección
      detections.forEach(detection => {
        const event = new CustomEvent('object-detected', {
          detail: detection
        });
        window.dispatchEvent(event);
      });
    }
  
    public async processFrame(videoElement: HTMLVideoElement) {
      if (!this.isProcessing || !this.worker) return;
  
      // Capturar frame
      this.canvas.width = videoElement.videoWidth;
      this.canvas.height = videoElement.videoHeight;
      this.ctx.drawImage(videoElement, 0, 0);
      
      // Enviar frame al worker
      const imageData = this.ctx.getImageData(
        0, 0, 
        this.canvas.width, 
        this.canvas.height
      );
      
      this.worker.postMessage({
        type: 'process-frame',
        imageData
      }, [imageData.data.buffer]);
    }
  
    public start() {
      this.isProcessing = true;
    }
  
    public stop() {
      this.isProcessing = false;
    }
  
    public destroy() {
      this.stop();
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
    }
  }
  
  export const videoProcessor = new VideoProcessor();