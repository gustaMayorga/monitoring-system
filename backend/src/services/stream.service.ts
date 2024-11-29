import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { CameraService } from './camera.service';
import { AIService } from './ai.service';
import { EventService } from './event.service';
import { Camera } from '../types/camera';
import * as tf from '@tensorflow/tfjs-node';
import { Detection, DetectionType } from '../types/detection';
import { AIDetection } from '../types/ai';

interface StreamOptions {
    outputPath?: string;
    enableRecording?: boolean;
    enableAI?: boolean;
    frameInterval?: number; // ms entre frames para procesar
}

export class StreamService {
    private activeStreams: Map<number, {
        process: any;
        recording?: any;
        aiInterval?: NodeJS.Timer;
    }> = new Map();

    constructor(
        private cameraService: CameraService,
        private aiService: AIService,
        private eventService: EventService,
        private baseStoragePath: string = process.env.STORAGE_PATH || 'storage/recordings'
    ) {
        // Asegurar que existe el directorio de grabaciones
        if (!fs.existsSync(this.baseStoragePath)) {
            fs.mkdirSync(this.baseStoragePath, { recursive: true });
        }
    }

    async startStream(camera: Camera, options: StreamOptions = {}): Promise<void> {
        const {
            outputPath = this.getDefaultOutputPath(camera),
            enableRecording = false,
            enableAI = false,
            frameInterval = 1000 // 1 frame por segundo por defecto
        } = options;

        // Iniciar stream RTSP
        const streamProcess = this.createStreamProcess(camera, outputPath);

        // Configurar grabación si está habilitada
        const recordingProcess = enableRecording ? 
            this.startRecording(camera, outputPath) : 
            undefined;

        // Configurar procesamiento de IA si está habilitado
        const aiInterval = enableAI ? 
            this.startAIProcessing(camera, frameInterval) : 
            undefined;

        this.activeStreams.set(camera.id, {
            process: streamProcess,
            recording: recordingProcess,
            aiInterval
        });
    }

    async stopStream(cameraId: number): Promise<void> {
        const stream = this.activeStreams.get(cameraId);
        if (!stream) return;

        // Detener todos los procesos
        if (stream.process) stream.process.kill();
        if (stream.recording) stream.recording.kill();
        if (stream.aiInterval) clearInterval(stream.aiInterval);

        this.activeStreams.delete(cameraId);
    }

    private createStreamProcess(camera: Camera, outputPath: string) {
        // Usar FFmpeg para manejar el stream RTSP
        const ffmpeg = spawn('ffmpeg', [
            '-i', camera.stream_url,
            '-c:v', 'copy',
            '-f', 'rtsp',
            outputPath
        ]);

        ffmpeg.stderr.on('data', (data) => {
            console.log(`FFmpeg (${camera.id}): ${data}`);
        });

        ffmpeg.on('error', (error) => {
            console.error(`Error en stream ${camera.id}:`, error);
            this.handleStreamError(camera, error);
        });

        return ffmpeg;
    }

    private startRecording(camera: Camera, streamUrl: string) {
        const date = new Date();
        const fileName = `${camera.id}_${date.toISOString().split('T')[0]}.mp4`;
        const filePath = path.join(this.baseStoragePath, fileName);

        // Usar FFmpeg para grabar el stream
        const ffmpeg = spawn('ffmpeg', [
            '-i', streamUrl,
            '-c:v', 'copy',
            '-c:a', 'copy',
            filePath
        ]);

        ffmpeg.stderr.on('data', (data) => {
            console.log(`FFmpeg Recording (${camera.id}): ${data}`);
        });

        return ffmpeg;
    }

    private startAIProcessing(camera: Camera, interval: number): NodeJS.Timer {
        return setInterval(async () => {
            try {
                // Capturar frame del stream
                const frame = await this.captureFrame(camera);
                if (!frame) return;

                // Convertir frame a tensor
                const tensor = tf.node.decodeImage(frame, 3) as tf.Tensor3D;

                // Procesar frame con IA
                const detections = await this.aiService.processFrame(
                    camera.id,
                    tensor,
                    new Date()
                );

                // Liberar memoria
                tensor.dispose();

                // Generar eventos basados en las detecciones
                if (detections.length > 0) {
                    await this.handleDetections(camera, detections);
                }
            } catch (error) {
                console.error(`Error procesando frame de cámara ${camera.id}:`, error);
            }
        }, interval);
    }

    private async captureFrame(camera: Camera): Promise<Buffer | null> {
        return new Promise((resolve) => {
            const ffmpeg = spawn('ffmpeg', [
                '-i', camera.stream_url,
                '-vframes', '1',
                '-f', 'image2pipe',
                '-vcodec', 'png',
                '-'
            ]);

            const chunks: Buffer[] = [];

            ffmpeg.stdout.on('data', (chunk) => {
                chunks.push(chunk);
            });

            ffmpeg.on('close', () => {
                resolve(Buffer.concat(chunks));
            });

            ffmpeg.on('error', () => {
                resolve(null);
            });
        });
    }

    private getDefaultOutputPath(camera: Camera): string {
        return `rtsp://localhost:8554/camera${camera.id}`;
    }

    private handleStreamError(camera: Camera, error: Error): void {
        this.eventService.createEvent({
            event_type_id: 1,
            camera_id: camera.id,
            client_id: camera.client_id!,
            description: `Error en stream: ${error.message}`,
            occurred_at: new Date(),
            metadata: { error: error.message }
        });
    }

    private async handleDetections(camera: Camera, detections: AIDetection[]): Promise<void> {
        const normalizedDetections: Detection[] = detections.map(d => ({
            type: d.type,
            confidence: d.confidence,
            bbox: d.bbox,
            timestamp: new Date(),
            metadata: d.metadata
        }));

        await this.eventService.createEvent({
            event_type_id: 2,
            camera_id: camera.id,
            client_id: camera.client_id!,
            description: `Detecciones: ${normalizedDetections.length}`,
            occurred_at: new Date(),
            metadata: { 
                detections: normalizedDetections
            }
        });
    }
} 