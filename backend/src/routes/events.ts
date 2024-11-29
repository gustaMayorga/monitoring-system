import express from 'express';
import { EventService } from '../services/event.service';
import { EventRepository } from '../repositories/event.repository';
import { authMiddleware, checkPermission } from '../middleware/auth';

const router = express.Router();
const eventRepository = new EventRepository();
const eventService = new EventService(eventRepository);

router.use(authMiddleware);

// Listar eventos con paginación y filtros
router.get('/', checkPermission('events:read'), async (req, res) => {
    try {
        const { page, pageSize, clientId, cameraId, status, fromDate, toDate } = req.query;
        
        const result = await eventService.getEvents({
            page: page ? Number(page) : undefined,
            pageSize: pageSize ? Number(pageSize) : undefined,
            clientId: clientId ? Number(clientId) : undefined,
            cameraId: cameraId ? Number(cameraId) : undefined,
            status: status?.toString(),
            fromDate: fromDate?.toString(),
            toDate: toDate?.toString()
        });

        res.json(result);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({ 
            message: 'Error al obtener los eventos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

// Obtener un evento específico
router.get('/:id', checkPermission('events:read'), async (req, res) => {
    try {
        const event = await eventService.getEventById(Number(req.params.id));
        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.json({ data: event });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el evento' });
    }
});

// Crear un nuevo evento
router.post('/', checkPermission('events:create'), async (req, res) => {
    try {
        const event = await eventService.createEvent(req.body);
        res.status(201).json({ data: event });
    } catch (error) {
        if (error instanceof Error && error.message === 'Tipo de evento no encontrado') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error al crear el evento' });
    }
});

// Actualizar estado de un evento
router.put('/:id/status', checkPermission('events:update'), async (req, res) => {
    try {
        const { status, notes } = req.body;
        const event = await eventService.updateEventStatus(Number(req.params.id), status, notes);
        res.json({ data: event });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Evento no encontrado') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'Estado inválido') {
                return res.status(400).json({ message: error.message });
            }
        }
        res.status(500).json({ message: 'Error al actualizar el estado del evento' });
    }
});

// Procesar un evento
router.post('/:id/process', checkPermission('events:manage'), async (req, res) => {
    try {
        const event = await eventService.processEvent(Number(req.params.id));
        res.json({ data: event });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Evento no encontrado') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message === 'El evento no está pendiente de procesamiento') {
                return res.status(400).json({ message: error.message });
            }
        }
        res.status(500).json({ message: 'Error al procesar el evento' });
    }
});

// Obtener tipos de eventos
router.get('/types', checkPermission('events:read'), async (req, res) => {
    try {
        const types = await eventService.getEventTypes();
        res.json({ data: types });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los tipos de eventos' });
    }
});

// Obtener eventos por rango de fechas
router.get('/range/:startDate/:endDate', checkPermission('events:read'), async (req, res) => {
    try {
        const { startDate, endDate } = req.params;
        const events = await eventService.getEventsByDateRange(
            new Date(startDate),
            new Date(endDate)
        );
        res.json({ data: events });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los eventos por rango de fechas' });
    }
});

// Obtener eventos por cliente
router.get('/client/:clientId', checkPermission('events:read'), async (req, res) => {
    try {
        const events = await eventService.getEventsByClient(Number(req.params.clientId));
        res.json({ data: events });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los eventos del cliente' });
    }
});

// Obtener eventos por cámara
router.get('/camera/:cameraId', checkPermission('events:read'), async (req, res) => {
    try {
        const events = await eventService.getEventsByCamera(Number(req.params.cameraId));
        res.json({ data: events });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los eventos de la cámara' });
    }
});

export const eventsRouter = router; 