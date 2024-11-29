import { StorageService } from './storage.service';
import { RecordingRepository } from '../repositories/recording.repository';
import { EventService } from './event.service';
import { RetentionPolicy, StorageQuota } from '../types/storage';
import { Logger } from '../utils/logger';

export class CleanupService {
    private isRunning = false;
    private logger: Logger;

    constructor(
        private storageService: StorageService,
        private recordingRepository: RecordingRepository,
        private eventService: EventService
    ) {
        this.logger = new Logger('CleanupService');
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            this.logger.warn('Cleanup service is already running');
            return;
        }

        this.isRunning = true;
        this.logger.info('Starting cleanup service');

        try {
            // Limpiar grabaciones expiradas
            await this.cleanupExpiredRecordings();

            // Verificar cuotas de almacenamiento
            await this.enforceStorageQuotas();

            // Comprimir grabaciones antiguas
            await this.compressOldRecordings();

        } catch (error) {
            this.logger.error('Error during cleanup:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    private async cleanupExpiredRecordings(): Promise<void> {
        this.logger.info('Starting expired recordings cleanup');

        // Obtener todas las políticas de retención
        const globalPolicy = await this.recordingRepository.findRetentionPolicy();
        
        // Procesar grabaciones expiradas por cámara
        const expiredRecordings = await this.recordingRepository.findExpiredRecordings(
            globalPolicy?.days || 30 // Default 30 días
        );

        for (const recording of expiredRecordings) {
            try {
                // Verificar política específica de la cámara
                const cameraPolicy = await this.recordingRepository.findRetentionPolicy(recording.camera_id);
                const policy = cameraPolicy || globalPolicy;

                if (!policy?.deleteAfter) {
                    this.logger.debug(`Skipping deletion for recording ${recording.id} (policy)`);
                    continue;
                }

                await this.handleExpiredRecording(recording, policy);

            } catch (error) {
                this.logger.error(`Error cleaning up recording ${recording.id}:`, error);
            }
        }
    }

    private async handleExpiredRecording(recording: any, policy: RetentionPolicy): Promise<void> {
        try {
            await this.storageService.deleteRecording(recording.id);
            await this.recordingRepository.update(recording.id, { status: 'deleted' });

            // Registrar evento
            await this.eventService.createEvent({
                event_type_id: 3, // Definir ID para eventos de limpieza
                camera_id: recording.camera_id,
                client_id: recording.client_id,
                description: `Recording deleted due to retention policy (${policy.days} days)`,
                occurred_at: new Date(),
                metadata: {
                    recording_id: recording.id,
                    policy_id: policy.id,
                    retention_days: policy.days
                }
            });

        } catch (error) {
            this.logger.error(`Error cleaning up recording ${recording.id}:`, error);
        }
    }

    private async enforceStorageQuotas(): Promise<void> {
        this.logger.info('Starting storage quota enforcement');

        // Obtener todas las cuotas de almacenamiento
        const quotas = await this.recordingRepository.findAllStorageQuotas();

        for (const quota of quotas) {
            try {
                const usage = await this.recordingRepository.getClientStorageUsage(quota.client_id);
                const usagePercentage = (usage.usedSize / (quota.maxSize * 1024 * 1024 * 1024)) * 100;

                await this.handleQuotaWarning(quota, usage, usagePercentage);

            } catch (error) {
                this.logger.error(`Error enforcing quota for client ${quota.client_id}:`, error);
            }
        }
    }

    private async handleQuotaWarning(quota: StorageQuota, usage: any, usagePercentage: number): Promise<void> {
        // Notificar cuando se alcanza el umbral de advertencia
        await this.eventService.createEvent({
            event_type_id: 4, // Definir ID para eventos de cuota
            client_id: quota.client_id,
            description: `Storage quota warning: ${usagePercentage.toFixed(1)}% used`,
            occurred_at: new Date(),
            metadata: { quota, usage }
        });

        if (usagePercentage >= 100) {
            await this.handleQuotaExceeded(quota);
        }
    }

    private async handleQuotaExceeded(quota: StorageQuota): Promise<void> {
        switch (quota.action) {
            case 'notify':
                await this.eventService.createEvent({
                    event_type_id: 5, // Definir ID para eventos de cuota excedida
                    client_id: quota.client_id,
                    description: 'Storage quota exceeded',
                    occurred_at: new Date(),
                    metadata: { quota }
                });
                break;

            case 'stop_recording':
                // Detener grabaciones para todas las cámaras del cliente
                const cameras = await this.recordingRepository.findClientCameras(quota.client_id);
                for (const camera of cameras) {
                    await this.storageService.stopRecording(camera.id);
                }
                break;

            case 'delete_oldest':
                await this.deleteOldestRecordings(quota);
                break;
        }
    }

    private async deleteOldestRecordings(quota: StorageQuota): Promise<void> {
        const usage = await this.recordingRepository.getClientStorageUsage(quota.client_id);
        const excessBytes = usage.usedSize - (quota.maxSize * 1024 * 1024 * 1024);

        if (excessBytes <= 0) return;

        const oldestRecordings = await this.recordingRepository.findOldestRecordings(
            quota.client_id,
            { minSize: excessBytes }
        );

        for (const recording of oldestRecordings) {
            await this.storageService.deleteRecording(recording.id);
            await this.recordingRepository.update(recording.id, { status: 'deleted' });
        }
    }

    private async compressOldRecordings(): Promise<void> {
        // Implementar compresión de grabaciones antiguas
        // Usar FFmpeg para recodificar con menor bitrate
    }
} 