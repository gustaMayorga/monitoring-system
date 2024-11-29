import { createServer } from 'http';
import { WebSocketService } from './services/websocket.service';
import { EventService } from './services/event.service';
import { EventRepository } from './repositories/event.repository';
import { app } from './app';  // Importar app desde app.ts
import config from './config';

const server = createServer(app);

// Inicializar servicios
const eventRepository = new EventRepository();
const eventService = new EventService(eventRepository);
const wsService = new WebSocketService(server, eventService, {
    path: config.server.ws.path
});

// Agregar el servicio WebSocket al eventService para notificaciones
eventService.setWebSocketService(wsService);

const PORT = config.server.port;

server.listen(PORT, () => {
    console.log(`Servidor HTTP escuchando en puerto ${PORT}`);
    console.log(`Servidor WebSocket escuchando en ws://localhost:${PORT}${config.server.ws.path}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
}); 