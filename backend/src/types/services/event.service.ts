import { Event, EventStatus } from '../event';
import { CreateEventDTO, UpdateEventDTO } from '../repositories/event.repository';
import { WebSocketService } from '../../services/websocket.service';

export interface IEventService {
    wsService?: WebSocketService;
    findAll(query: EventQuery): Promise<Event[]>;
    findById(id: number): Promise<Event | null>;
    createEvent(data: CreateEventDTO): Promise<Event>;
    updateEventStatus(id: number, status: EventStatus, notes?: string): Promise<Event>;
    processEvent(id: number): Promise<Event>;
    getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
    getEventsByClient(clientId: number): Promise<Event[]>;
    getEventsByCamera(cameraId: number): Promise<Event[]>;
}

export interface EventQuery {
    clientId?: number;
    cameraId?: number;
    eventTypeId?: number;
    fromDate?: string;
    toDate?: string;
    severity?: string;
    status?: EventStatus;
    page?: number;
    limit?: number;
} 