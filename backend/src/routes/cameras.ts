import express from 'express';
import { CameraService } from '../services/camera.service';
import { CameraRepository } from '../repositories/camera.repository';
import { authMiddleware, checkPermission } from '../middleware/auth';

const router = express.Router();
const cameraRepository = new CameraRepository();
const cameraService = new CameraService(cameraRepository);

router.use(authMiddleware);

router.get('/', checkPermission('cameras:read'), async (req, res) => {
    try {
        const cameras = await cameraService.getAllCameras();
        res.json({ data: cameras });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las cámaras' });
    }
});

router.get('/:id', checkPermission('cameras:read'), async (req, res) => {
    try {
        const camera = await cameraService.getCameraById(Number(req.params.id));
        if (!camera) {
            return res.status(404).json({ message: 'Cámara no encontrada' });
        }
        res.json({ data: camera });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la cámara' });
    }
});

router.post('/', checkPermission('cameras:create'), async (req, res) => {
    try {
        const camera = await cameraService.createCamera(req.body);
        res.status(201).json({ data: camera });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la cámara' });
    }
});

router.put('/:id', checkPermission('cameras:update'), async (req, res) => {
    try {
        const camera = await cameraService.updateCamera(Number(req.params.id), req.body);
        res.json({ data: camera });
    } catch (error) {
        if (error instanceof Error && error.message === 'Cámara no encontrada') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al actualizar la cámara' });
    }
});

router.delete('/:id', checkPermission('cameras:delete'), async (req, res) => {
    try {
        await cameraService.deleteCamera(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        if (error instanceof Error && error.message === 'Cámara no encontrada') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al eliminar la cámara' });
    }
});

router.post('/:id/check-connection', checkPermission('cameras:manage'), async (req, res) => {
    try {
        const isConnected = await cameraService.checkCameraConnection(Number(req.params.id));
        res.json({ data: { connected: isConnected } });
    } catch (error) {
        if (error instanceof Error && error.message === 'Cámara no encontrada') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al verificar la conexión' });
    }
});

export const camerasRouter = router; 