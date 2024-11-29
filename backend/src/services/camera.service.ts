import { CameraRepository, DbCamera } from '../repositories/camera.repository';
import { Camera, CreateCameraDTO, UpdateCameraDTO, CameraStatus } from '../types/camera';

export class CameraService {
    constructor(private cameraRepository: CameraRepository) {}

    private mapDbCameraToCamera(dbCamera: DbCamera): Camera {
        return {
            ...dbCamera,
            vendor: dbCamera.vendor as Camera['vendor'],
            status: dbCamera.status as CameraStatus
        };
    }

    async getAllCameras(): Promise<Camera[]> {
        const cameras = await this.cameraRepository.findAll();
        return cameras.map(this.mapDbCameraToCamera);
    }

    async getCameraById(id: number): Promise<Camera | null> {
        const camera = await this.cameraRepository.findById(id);
        if (!camera) return null;
        return this.mapDbCameraToCamera(camera);
    }

    async createCamera(data: CreateCameraDTO): Promise<Camera> {
        const camera = await this.cameraRepository.create(data);
        return this.mapDbCameraToCamera(camera);
    }

    async updateCamera(id: number, data: UpdateCameraDTO): Promise<Camera> {
        const camera = await this.cameraRepository.update(id, data);
        return this.mapDbCameraToCamera(camera);
    }

    async deleteCamera(id: number): Promise<void> {
        await this.cameraRepository.delete(id);
    }

    async checkCameraConnection(id: number): Promise<boolean> {
        const camera = await this.getCameraById(id);
        if (!camera) return false;

        try {
            // Implementar lógica de verificación de conexión
            return true;
        } catch (error) {
            return false;
        }
    }
} 