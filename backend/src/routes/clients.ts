import express from 'express';
import { ClientService } from '../services/client.service';
import { ClientRepository } from '../repositories/client.repository';
import { authMiddleware, checkPermission } from '../middleware/auth';

const router = express.Router();
const clientRepository = new ClientRepository();
const clientService = new ClientService(clientRepository);

router.use(authMiddleware);

// Listar clientes
router.get('/', checkPermission('clients:read'), async (req, res) => {
    try {
        const clients = await clientService.getAllClients();
        res.json({ data: clients });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los clientes' });
    }
});

// Obtener clientes activos
router.get('/active', checkPermission('clients:read'), async (req, res) => {
    try {
        const clients = await clientService.getActiveClients();
        res.json({ data: clients });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los clientes activos' });
    }
});

// Obtener un cliente
router.get('/:id', checkPermission('clients:read'), async (req, res) => {
    try {
        const client = await clientService.getClientById(Number(req.params.id));
        if (!client) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ data: client });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el cliente' });
    }
});

// Crear cliente
router.post('/', checkPermission('clients:create'), async (req, res) => {
    try {
        const client = await clientService.createClient(req.body);
        res.status(201).json({ data: client });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el cliente' });
    }
});

// Actualizar cliente
router.put('/:id', checkPermission('clients:update'), async (req, res) => {
    try {
        const client = await clientService.updateClient(Number(req.params.id), req.body);
        res.json({ data: client });
    } catch (error) {
        if (error instanceof Error && error.message === 'Cliente no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al actualizar el cliente' });
    }
});

// Eliminar cliente
router.delete('/:id', checkPermission('clients:delete'), async (req, res) => {
    try {
        await clientService.deleteClient(Number(req.params.id));
        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Cliente no encontrado') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('tiene cámaras asociadas')) {
                return res.status(400).json({ message: error.message });
            }
        }
        res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
});

// Obtener cámaras del cliente
router.get('/:id/cameras', checkPermission('clients:read'), async (req, res) => {
    try {
        const cameras = await clientService.getClientCameras(Number(req.params.id));
        res.json({ data: cameras });
    } catch (error) {
        if (error instanceof Error && error.message === 'Cliente no encontrado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al obtener las cámaras del cliente' });
    }
});

export const clientsRouter = router; 