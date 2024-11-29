import { db } from '../database';
import { Event, EventType } from '../types/event';
import { CreateEventDTO, UpdateEventDTO, EventRepositoryOptions } from '../types/repositories/event.repository';
import { Attachment } from '../types/attachment';

export class EventRepository {
    async findAll(options: EventRepositoryOptions = {}): Promise<Event[]> {
        const query = db('events')
            .select('events.*')
            .leftJoin('event_types', 'events.event_type_id', 'event_types.id')
            .leftJoin('cameras', 'events.camera_id', 'cameras.id')
            .leftJoin('clients', 'events.client_id', 'clients.id')
            .orderBy('events.occurred_at', 'desc');

        if (options.clientId) {
            query.where('events.client_id', options.clientId);
        }

        if (options.cameraId) {
            query.where('events.camera_id', options.cameraId);
        }

        if (options.eventTypeId) {
            query.where('events.event_type_id', options.eventTypeId);
        }

        if (options.startDate) {
            query.where('events.occurred_at', '>=', options.startDate);
        }

        if (options.endDate) {
            query.where('events.occurred_at', '<=', options.endDate);
        }

        if (options.limit) {
            query.limit(options.limit);
        }

        if (options.offset) {
            query.offset(options.offset);
        }

        const events = await query;
        return this.hydrateEvents(events);
    }

    async findById(id: number): Promise<Event | undefined> {
        const event = await db('events')
            .select([
                'events.*',
                'event_types.name as event_type_name',
                'event_types.severity as event_type_severity'
            ])
            .leftJoin('event_types', 'events.event_type_id', 'event_types.id')
            .where('events.id', id)
            .first();

        if (event) {
            // Convertir los campos de fecha
            event.occurred_at = new Date(event.occurred_at);
            event.created_at = new Date(event.created_at);
            event.updated_at = new Date(event.updated_at);

            // Cargar relaciones
            event.attachments = await this.findAttachments(id);
            if (event.camera_id) {
                event.camera = await db('cameras')
                    .where('id', event.camera_id)
                    .first();
            }
            if (event.client_id) {
                event.client = await db('clients')
                    .where('id', event.client_id)
                    .first();
            }
        }

        return event;
    }

    async create(data: CreateEventDTO): Promise<Event> {
        const timestamp = new Date();
        const eventData = {
            ...data,
            created_at: timestamp,
            updated_at: timestamp,
            status: 'pending' as const
        };

        const [row] = await db('events')
            .insert(eventData)
            .returning([
                'id',
                'event_type_id',
                'camera_id',
                'client_id',
                'description',
                'occurred_at',
                'metadata',
                'notes',
                'status',
                'created_at',
                'updated_at'
            ]) as [Event & { occurred_at: string; created_at: string; updated_at: string }];

        const event = {
            ...row,
            occurred_at: new Date(row.occurred_at),
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        } as Event;

        if (data.attachments?.length) {
            event.attachments = await this.createAttachments(event.id, data.attachments);
        }

        return event;
    }

    async update(id: number, data: UpdateEventDTO): Promise<Event> {
        const timestamp = new Date();
        const updateData = {
            ...data,
            updated_at: timestamp
        };

        const [row] = await db('events')
            .where('id', id)
            .update(updateData)
            .returning([
                'id',
                'event_type_id',
                'camera_id',
                'client_id',
                'description',
                'occurred_at',
                'metadata',
                'notes',
                'status',
                'created_at',
                'updated_at'
            ]) as [Event & { occurred_at: string; created_at: string; updated_at: string }];

        const event = {
            ...row,
            occurred_at: new Date(row.occurred_at),
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        } as Event;

        event.attachments = await this.findAttachments(id);
        return event;
    }

    async delete(id: number): Promise<void> {
        await db('events')
            .where('id', id)
            .delete();
    }

    private async findAttachments(eventId: number): Promise<Attachment[]> {
        return db('event_attachments')
            .where('event_id', eventId)
            .orderBy('created_at', 'asc');
    }

    private async createAttachments(
        eventId: number,
        attachments: CreateEventDTO['attachments']
    ): Promise<Attachment[]> {
        if (!attachments?.length) return [];

        const records = attachments.map(attachment => ({
            event_id: eventId,
            ...attachment
        }));

        return db('event_attachments').insert(records).returning('*');
    }

    async count(options: {
        clientId?: number;
        cameraId?: number;
        eventTypeId?: number;
        startDate?: Date;
        endDate?: Date;
        severity?: string;
    } = {}): Promise<number> {
        const result = await db('events')
            .count('* as count')
            .modify(query => {
                if (options.clientId) {
                    query.where('client_id', options.clientId);
                }
                if (options.cameraId) {
                    query.where('camera_id', options.cameraId);
                }
                if (options.eventTypeId) {
                    query.where('event_type_id', options.eventTypeId);
                }
                if (options.startDate) {
                    query.where('occurred_at', '>=', options.startDate);
                }
                if (options.endDate) {
                    query.where('occurred_at', '<=', options.endDate);
                }
                if (options.severity) {
                    query.join('event_types', 'events.event_type_id', 'event_types.id')
                        .where('event_types.severity', options.severity);
                }
            })
            .first() as { count: string };

        return parseInt(result.count);
    }

    async findAllEventTypes(): Promise<EventType[]> {
        return db('event_types')
            .select('*')
            .orderBy('name', 'asc');
    }

    private async hydrateEvents(events: any[]): Promise<Event[]> {
        const hydratedEvents = await Promise.all(events.map(async event => {
            // Convertir los campos de fecha
            event.occurred_at = new Date(event.occurred_at);
            event.created_at = new Date(event.created_at);
            event.updated_at = new Date(event.updated_at);

            // Cargar relaciones
            event.attachments = await this.findAttachments(event.id);
            if (event.camera_id) {
                event.camera = await db('cameras')
                    .where('id', event.camera_id)
                    .first();
            }
            if (event.client_id) {
                event.client = await db('clients')
                    .where('id', event.client_id)
                    .first();
            }

            return event;
        }));

        return hydratedEvents;
    }
} 