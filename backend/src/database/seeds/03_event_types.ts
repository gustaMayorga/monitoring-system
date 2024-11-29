import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
    // Limpiar las tablas
    await knex('event_attachments').del();
    await knex('events').del();
    await knex('event_types').del();

    // Insertar tipos de eventos
    const eventTypes = await knex('event_types').insert([
        {
            name: 'Movimiento detectado',
            description: 'Se detectó movimiento en la cámara',
            severity: 'info',
            icon: 'motion',
            color: '#3498db'
        },
        {
            name: 'Persona detectada',
            description: 'Se detectó una persona en la cámara',
            severity: 'warning',
            icon: 'person',
            color: '#f1c40f'
        },
        {
            name: 'Acceso no autorizado',
            description: 'Se detectó un acceso no autorizado',
            severity: 'critical',
            icon: 'alert',
            color: '#e74c3c'
        }
    ]).returning('*');

    // Insertar algunos eventos de prueba
    const cameras = await knex('cameras').select('*');
    const clients = await knex('clients').select('*');

    if (cameras.length > 0 && clients.length > 0) {
        const events = await knex('events').insert([
            {
                event_type_id: eventTypes[0].id,
                camera_id: cameras[0].id,
                client_id: clients[0].id,
                occurred_at: new Date(),
                status: 'processed',
                metadata: { confidence: 0.95 }
            },
            {
                event_type_id: eventTypes[1].id,
                camera_id: cameras[0].id,
                client_id: clients[0].id,
                occurred_at: new Date(),
                status: 'pending',
                metadata: { confidence: 0.85 }
            }
        ]).returning('*');

        // Insertar algunos adjuntos de prueba
        await knex('event_attachments').insert([
            {
                event_id: events[0].id,
                type: 'image',
                url: 'https://example.com/event1.jpg',
                thumbnail_url: 'https://example.com/event1-thumb.jpg'
            },
            {
                event_id: events[1].id,
                type: 'video',
                url: 'https://example.com/event2.mp4',
                thumbnail_url: 'https://example.com/event2-thumb.jpg'
            }
        ]);
    }
} 