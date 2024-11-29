import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { Camera } from '../types/camera';
import { Attachment } from '../types/event';
import { StorageConfig } from '../types/storage';
import { RecordingRepository } from '../repositories/recording.repository';

export class StorageService {
    private s3Client?: AWS.S3;
    private localBasePath: string;

    constructor(
        private config: StorageConfig,
        private recordingRepository: RecordingRepository
    ) {
        this.localBasePath = config.local?.basePath || path.join(process.cwd(), 'storage');

        if (config.provider === 's3' && config.s3) {
            this.s3Client = new AWS.S3({
                accessKeyId: config.s3.accessKeyId,
                secretAccessKey: config.s3.secretAccessKey,
                region: config.s3.region
            });
        }

        // Asegurar que existan los directorios necesarios
        this.ensureDirectories();
    }

    private async ensureDirectories() {
        const dirs = ['recordings', 'snapshots', 'events', 'thumbnails'];
        for (const dir of dirs) {
            const dirPath = path.join(this.localBasePath, dir);
            await fs.promises.mkdir(dirPath, { recursive: true });
        }
    }

    async saveEventAttachment(
        eventId: number,
        file: Buffer | string,
        metadata: {
            type: Attachment['type'];
            filename: string;
            size: number;
            metadata?: Record<string, any>;
        }
    ): Promise<Attachment> {
        const timestamp = new Date();
        let url: string;
        let thumbnailUrl: string | undefined;

        if (this.config.provider === 's3') {
            url = await this.uploadToS3(file, 'events', metadata.filename);
            if (metadata.type === 'image' || metadata.type === 'video') {
                const thumbnail = await this.generateThumbnail(file, metadata.type);
                thumbnailUrl = await this.uploadToS3(thumbnail, 'thumbnails', `thumb_${metadata.filename}`);
            }
        } else {
            url = await this.saveToLocal(file, 'events', metadata.filename);
            if (metadata.type === 'image' || metadata.type === 'video') {
                const thumbnail = await this.generateThumbnail(file, metadata.type);
                thumbnailUrl = await this.saveToLocal(thumbnail, 'thumbnails', `thumb_${metadata.filename}`);
            }
        }

        return {
            id: 0, // La base de datos asignará el ID real
            event_id: eventId,
            type: metadata.type,
            url,
            thumbnail_url: thumbnailUrl,
            filename: metadata.filename,
            size: metadata.size,
            metadata: metadata.metadata,
            created_at: timestamp,
            updated_at: timestamp
        };
    }

    async deleteRecording(id: number): Promise<void> {
        const recording = await this.recordingRepository.findById(id);
        if (!recording) {
            throw new Error(`Recording ${id} not found`);
        }

        if (this.config.provider === 's3') {
            await this.deleteFromS3(recording.path);
        } else {
            await fs.promises.unlink(recording.path);
        }
    }

    async stopRecording(cameraId: number): Promise<void> {
        const activeRecording = await this.recordingRepository.findActiveRecording(cameraId);
        if (!activeRecording) return;

        await this.recordingRepository.update(activeRecording.id, {
            status: 'completed',
            end_time: new Date()
        });
    }

    private async uploadToS3(file: Buffer | string, type: string, fileName: string): Promise<string> {
        if (!this.s3Client || !this.config.s3) {
            throw new Error('S3 not configured');
        }

        const key = `${type}/${fileName}`;
        await this.s3Client.putObject({
            Bucket: this.config.s3.bucket,
            Key: key,
            Body: file
        }).promise();

        return `https://${this.config.s3.bucket}.s3.amazonaws.com/${key}`;
    }

    private async deleteFromS3(path: string): Promise<void> {
        if (!this.s3Client || !this.config.s3) {
            throw new Error('S3 not configured');
        }

        const key = path.replace(`https://${this.config.s3.bucket}.s3.amazonaws.com/`, '');
        await this.s3Client.deleteObject({
            Bucket: this.config.s3.bucket,
            Key: key
        }).promise();
    }

    private async saveToLocal(file: Buffer | string, type: string, fileName: string): Promise<string> {
        const destinationDir = path.join(this.localBasePath, type);
        const destinationPath = path.join(destinationDir, fileName);

        if (typeof file === 'string') {
            // Es una ruta de archivo
            await fs.promises.copyFile(file, destinationPath);
        } else {
            // Es un buffer
            await fs.promises.writeFile(destinationPath, file);
        }

        return destinationPath;
    }

    private async generateThumbnail(file: Buffer | string, type: 'image' | 'video'): Promise<Buffer> {
        // TODO: Implementar generación de thumbnails
        // Para imágenes: usar sharp
        // Para videos: usar ffmpeg
        // Por ahora retornamos un buffer vacío
        return Buffer.from([]);
    }

    async saveRecording(
        camera: Camera,
        filePath: string,
        metadata: {
            start_time: Date;
            end_time: Date;
            size: number;
            format: string;
        }
    ): Promise<string> {
        const fileName = `${camera.id}_${metadata.start_time.toISOString()}.${metadata.format}`;
        let storagePath: string;

        if (this.config.provider === 's3') {
            storagePath = await this.uploadToS3(filePath, 'recordings', fileName);
        } else {
            storagePath = await this.saveToLocal(filePath, 'recordings', fileName);
        }

        // Calcular duración en segundos
        const duration = Math.round(
            (metadata.end_time.getTime() - metadata.start_time.getTime()) / 1000
        );

        // Guardar metadata en base de datos
        await this.recordingRepository.create({
            camera_id: camera.id,
            path: storagePath,
            start_time: metadata.start_time,
            end_time: metadata.end_time,
            duration,
            size: metadata.size,
            format: metadata.format,
            status: 'completed'
        });

        return storagePath;
    }

    async saveSnapshot(
        camera: Camera,
        buffer: Buffer,
        metadata: {
            timestamp: Date;
            format: string;
            reason?: string;
        }
    ): Promise<string> {
        const fileName = `${camera.id}_${metadata.timestamp.toISOString()}.${metadata.format}`;
        let storagePath: string;

        if (this.config.provider === 's3') {
            storagePath = await this.uploadToS3(buffer, 'snapshots', fileName);
        } else {
            storagePath = await this.saveToLocal(buffer, 'snapshots', fileName);
        }

        // TODO: Guardar metadata del snapshot en base de datos si es necesario

        return storagePath;
    }

    async getRecordingStream(recordingId: number): Promise<fs.ReadStream | AWS.S3.Body> {
        const recording = await this.recordingRepository.findById(recordingId);
        if (!recording) {
            throw new Error(`Recording ${recordingId} not found`);
        }

        if (this.config.provider === 's3') {
            if (!this.s3Client || !this.config.s3) {
                throw new Error('S3 not configured');
            }

            const key = recording.path.replace(
                `https://${this.config.s3.bucket}.s3.amazonaws.com/`,
                ''
            );

            const response = await this.s3Client
                .getObject({
                    Bucket: this.config.s3.bucket,
                    Key: key
                })
                .promise();

            return response.Body!;
        } else {
            return fs.createReadStream(recording.path);
        }
    }

    async getStorageStats(clientId?: number): Promise<{
        usedSpace: number;
        recordingsCount: number;
        oldestRecording?: Date;
        newestRecording?: Date;
    }> {
        // TODO: Implementar estadísticas de almacenamiento
        return {
            usedSpace: 0,
            recordingsCount: 0
        };
    }

    // ... resto del código ...
} 