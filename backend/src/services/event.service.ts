import { EventRepository } from '../repositories/event.repository';
import { Event, EventStatus, EventQuery } from '../types/event';
import { CreateEventDTO, UpdateEventDTO } from '../types/repositories/event.repository';
import { WebSocketService } from './websocket.service';

export class EventService {
    private wsService?: WebSocketService;

    constructor(private eventRepository: EventRepository) {}

    setWebSocketService(wsService: WebSocketService) {
        this.wsService = wsService;
    }

    async findAll(query: EventQuery): Promise<Event[]> {
        return this.eventRepository.findAll({
            clientId: query.clientId,
            cameraId: query.cameraId,
            eventTypeId: query.eventTypeId,
            startDate: query.fromDate ? new Date(query.fromDate) : undefined,
            endDate: query.toDate ? new Date(query.toDate) : undefined,
            limit: query.limit
        });
    }

    async findById(id: number): Promise<Event | null> {
        const event = await this.eventRepository.findById(id);
        return event || null;
    }

    async createEvent(data: CreateEventDTO): Promise<Event> {
        const event = await this.eventRepository.create(data);
        
        if (this.wsService) {
            this.wsService.broadcastEvent(event);
        }

        return event;
    }

    async updateEventStatus(id: number, status: EventStatus, notes?: string): Promise<Event> {
        const event = await this.eventRepository.findById(id);
        if (!event) {
            throw new Error('Event not found');
        }

        const updatedEvent = await this.eventRepository.update(id, { status, notes });

        if (this.wsService) {
            this.wsService.broadcastEvent(updatedEvent);
        }

        return updatedEvent;
    }
} 