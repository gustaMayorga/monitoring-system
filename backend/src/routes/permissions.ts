import express from 'express';
import { PermissionService } from '../services/permission.service';
import { PermissionRepository } from '../repositories/permission.repository';
import { authMiddleware, checkPermission } from '../middleware/auth';

const router = express.Router();
const permissionRepository = new PermissionRepository();
const permissionService = new PermissionService(permissionRepository);

router.use(authMiddleware);

// Listar permisos
router.get('/', checkPermission('permissions:read'), async (req, res) => {
    try {
        const permissions = await permissionService.getAllPermissions();
        res.json({ data: permissions });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los permisos' });
    }
});

// Obtener un permiso
router.get('/:id', checkPermission('permissions:read'), async (req, res) => {
    try {
        const permission = await permissionService.getPermissionById(Number(req.params.id));
        if (!permission) {
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }
        res.json({ data: permission });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el permiso' });
    }
});

// Crear permiso
router.post('/', checkPermission('permissions:create'), async (req, res) => {
    try {
        const permission = await permissionService.createPermission(req.body);
        res.status(201).json({ data: permission });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Permission already exists') {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('Invalid permission name format')) {
                return res.status(400).json({ message: error.message });
            }
        }
        res.status(500).json({ message: 'Error al crear el permiso' });
    }
});

// Actualizar permiso
router.put('/:id', checkPermission('permissions:update'), async (req, res) => {
    try {
        const permission = await permissionService.updatePermission(Number(req.params.id), req.body);
        res.json({ data: permission });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Permission not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Permission name already exists' || 
                error.message.includes('Invalid permission name format')) {
                return res.status(400).json({ message: error.message });
            }
        }
        res.status(500).json({ message: 'Error al actualizar el permiso' });
    }
});

// Eliminar permiso
router.delete('/:id', checkPermission('permissions:delete'), async (req, res) => {
    try {
        await permissionService.deletePermission(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        if (error instanceof Error && error.message === 'Permission not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al eliminar el permiso' });
    }
});

// Obtener permisos por recurso
router.get('/resource/:resource', checkPermission('permissions:read'), async (req, res) => {
    try {
        const permissions = await permissionService.getPermissionsByResource(req.params.resource);
        res.json({ data: permissions });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los permisos' });
    }
});

export const permissionsRouter = router; 