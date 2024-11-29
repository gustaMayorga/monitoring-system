import express from 'express';
import { RoleService } from '../services/role.service';
import { RoleRepository } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';
import { authMiddleware, checkPermission } from '../middleware/auth';

const router = express.Router();
const roleRepository = new RoleRepository();
const permissionRepository = new PermissionRepository();
const roleService = new RoleService(roleRepository, permissionRepository);

router.use(authMiddleware);

// Listar roles
router.get('/', checkPermission('roles:read'), async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.json({ data: roles });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los roles' });
    }
});

// Obtener un rol
router.get('/:id', checkPermission('roles:read'), async (req, res) => {
    try {
        const role = await roleService.getRoleById(Number(req.params.id));
        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        res.json({ data: role });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el rol' });
    }
});

// Crear rol
router.post('/', checkPermission('roles:create'), async (req, res) => {
    try {
        const role = await roleService.createRole(req.body);
        res.status(201).json({ data: role });
    } catch (error) {
        if (error instanceof Error && error.message === 'Role already exists') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al crear el rol' });
    }
});

// Actualizar rol
router.put('/:id', checkPermission('roles:update'), async (req, res) => {
    try {
        const role = await roleService.updateRole(Number(req.params.id), req.body);
        res.json({ data: role });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Role not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Role name already exists') {
                return res.status(400).json({ message: error.message });
            }
        }
        res.status(500).json({ message: 'Error al actualizar el rol' });
    }
});

// Eliminar rol
router.delete('/:id', checkPermission('roles:delete'), async (req, res) => {
    try {
        await roleService.deleteRole(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        if (error instanceof Error && error.message === 'Role not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al eliminar el rol' });
    }
});

// Obtener permisos de un rol
router.get('/:id/permissions', checkPermission('roles:read'), async (req, res) => {
    try {
        const permissions = await roleService.getRolePermissions(Number(req.params.id));
        res.json({ data: permissions });
    } catch (error) {
        if (error instanceof Error && error.message === 'Role not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al obtener los permisos del rol' });
    }
});

// Asignar permisos a un rol
router.post('/:id/permissions', checkPermission('roles:manage'), async (req, res) => {
    try {
        await roleService.setRolePermissions(Number(req.params.id), req.body.permissions);
        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Role not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Some permissions do not exist') {
                return res.status(400).json({ message: error.message });
            }
        }
        res.status(500).json({ message: 'Error al asignar permisos al rol' });
    }
});

export const rolesRouter = router; 