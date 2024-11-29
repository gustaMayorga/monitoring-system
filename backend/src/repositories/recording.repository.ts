import { db } from '../database';
import { RecordingMetadata, RetentionPolicy, StorageQuota } from '../types/storage';
import { Camera } from '../types/camera';

export class RecordingRepository {
    async findAll(options: {
        cameraId?: number;
        clientId?: number;
        startDate?: Date;
        endDate?: Date;
        status?: RecordingMetadata['status'];
        limit?: number;
        offset?: number;
    } = {}): Promise<RecordingMetadata[]> {
        const query = db('recordings')
            .select('recordings.*')
            .join('cameras', 'recordings.camera_id', 'cameras.id')
            .orderBy('recordings.start_time', 'desc');

        if (options.cameraId) {
            query.where('recordings.camera_id', options.cameraId);
        }

        if (options.clientId) {
            query.where('cameras.client_id', options.clientId);
        }

        if (options.startDate) {
            query.where('recordings.start_time', '>=', options.startDate);
        }

        if (options.endDate) {
            query.where('recordings.start_time', '<=', options.endDate);
        }

        if (options.status) {
            query.where('recordings.status', options.status);
        }

        if (options.limit) {
            query.limit(options.limit);
        }

        if (options.offset) {
            query.offset(options.offset);
        }

        return query;
    }

    async findById(id: number): Promise<RecordingMetadata | undefined> {
        return db('recordings')
            .where('id', id)
            .first();
    }

    async create(data: Omit<RecordingMetadata, 'id' | 'created_at' | 'updated_at'>): Promise<RecordingMetadata> {
        const [recording] = await db('recordings')
            .insert(data)
            .returning('*');

        return recording;
    }

    async update(id: number, data: Partial<RecordingMetadata>): Promise<RecordingMetadata> {
        const [recording] = await db('recordings')
            .where('id', id)
            .update({
                ...data,
                updated_at: new Date()
            })
            .returning('*');

        return recording;
    }

    async delete(id: number): Promise<void> {
        await db('recordings')
            .where('id', id)
            .delete();
    }

    async getStorageStats(clientId?: number): Promise<{
        totalSize: number;
        recordingsCount: number;
        oldestRecording?: Date;
        newestRecording?: Date;
    }> {
        const query = db('recordings')
            .join('cameras', 'recordings.camera_id', 'cameras.id')
            .where('recordings.status', 'completed');

        if (clientId) {
            query.where('cameras.client_id', clientId);
        }

        const [stats] = await query
            .select(
                db.raw('SUM(size) as total_size'),
                db.raw('COUNT(*) as recordings_count'),
                db.raw('MIN(start_time) as oldest_recording'),
                db.raw('MAX(start_time) as newest_recording')
            );

        return {
            totalSize: parseInt(stats.total_size) || 0,
            recordingsCount: parseInt(stats.recordings_count) || 0,
            oldestRecording: stats.oldest_recording,
            newestRecording: stats.newest_recording
        };
    }

    async findRetentionPolicy(cameraId?: number): Promise<RetentionPolicy | undefined> {
        const query = db('retention_policies')
            .orderBy('created_at', 'desc')
            .limit(1);

        if (cameraId) {
            query.where('camera_id', cameraId);
        } else {
            query.whereNull('camera_id');
        }

        return query.first();
    }

    async findStorageQuota(clientId: number): Promise<StorageQuota | undefined> {
        return db('storage_quotas')
            .where('client_id', clientId)
            .first();
    }

    async findExpiredRecordings(retentionDays: number): Promise<RecordingMetadata[]> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        return db('recordings')
            .where('status', 'completed')
            .where('end_time', '<=', cutoffDate)
            .orderBy('end_time', 'asc');
    }

    async getClientStorageUsage(clientId: number): Promise<{
        usedSize: number;
        quota?: number;
    }> {
        const [usage] = await db('recordings')
            .join('cameras', 'recordings.camera_id', 'cameras.id')
            .where('cameras.client_id', clientId)
            .where('recordings.status', 'completed')
            .select(db.raw('SUM(recordings.size) as used_size'));

        const quota = await db('storage_quotas')
            .where('client_id', clientId)
            .first();

        return {
            usedSize: parseInt(usage.used_size) || 0,
            quota: quota?.maxSize
        };
    }

    async findAllStorageQuotas(): Promise<StorageQuota[]> {
        return db('storage_quotas')
            .select('*')
            .orderBy('client_id');
    }

    async findClientCameras(clientId: number): Promise<Camera[]> {
        return db('cameras')
            .where('client_id', clientId)
            .where('status', 'active');
    }

    async findOldestRecordings(
        clientId: number,
        options: { minSize: number }
    ): Promise<RecordingMetadata[]> {
        return db('recordings')
            .join('cameras', 'recordings.camera_id', 'cameras.id')
            .where('cameras.client_id', clientId)
            .where('recordings.status', 'completed')
            .orderBy('recordings.start_time', 'asc')
            .select('recordings.*')
            .limit(100); // Procesar en lotes
    }

    async findActiveRecording(cameraId: number): Promise<RecordingMetadata | undefined> {
        return db('recordings')
            .where({
                camera_id: cameraId,
                status: 'recording'
            })
            .first();
    }
} 