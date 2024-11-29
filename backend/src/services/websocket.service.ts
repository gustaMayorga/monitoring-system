import WebSocket from 'ws';
import { Server } from 'http';
import { EventService } from './event.service';
import { Event } from '../types/event';

interface WebSocketClient extends WebSocket {
    clientId?: number;
    subscriptions?: Set<string>;
}

interface WebSocketOptions {
    path?: string;
}

export class WebSocketService {
    private wss: WebSocket.Server;
    private clients: Set<WebSocketClient> = new Set();

    constructor(
        server: Server, 
        private eventService: EventService,
        options: WebSocketOptions = {}
    ) {
        this.wss = new WebSocket.Server({ 
            server,
            path: options.path
        });
        this.setupWebSocket();
    }

    private setupWebSocket() {
        this.wss.on('connection', (ws: WebSocketClient) => {
            console.log('Cliente WebSocket conectado');
            this.clients.add(ws);

            ws.subscriptions = new Set();

            ws.on('message', async (message: string) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleMessage(ws, data);
                } catch (error) {
                    this.sendError(ws, 'Mensaje inválido');
                }
            });

            ws.on('close', () => {
                console.log('Cliente WebSocket desconectado');
                this.clients.delete(ws);
            });
        });
    }

    private async handleMessage(ws: WebSocketClient, data: any) {
        switch (data.type) {
            case 'subscribe':
                this.handleSubscribe(ws, data);
                break;
            case 'unsubscribe':
                this.handleUnsubscribe(ws, data);
                break;
            case 'authenticate':
                await this.handleAuthenticate(ws, data);
                break;
            default:
                this.sendError(ws, 'Tipo de mensaje no soportado');
        }
    }

    private handleSubscribe(ws: WebSocketClient, data: any) {
        if (!ws.clientId) {
            return this.sendError(ws, 'No autenticado');
        }

        if (data.channel) {
            ws.subscriptions?.add(data.channel);
            this.send(ws, {
                type: 'subscribed',
                channel: data.channel
            });
        }
    }

    private handleUnsubscribe(ws: WebSocketClient, data: any) {
        if (data.channel) {
            ws.subscriptions?.delete(data.channel);
            this.send(ws, {
                type: 'unsubscribed',
                channel: data.channel
            });
        }
    }

    private async handleAuthenticate(ws: WebSocketClient, data: any) {
        // Aquí deberías validar el token y obtener el clientId
        // Por ahora solo guardamos el clientId proporcionado
        if (data.clientId) {
            ws.clientId = data.clientId;
            this.send(ws, {
                type: 'authenticated',
                clientId: data.clientId
            });
        }
    }

    public broadcastEvent(event: Event) {
        const message = {
            type: 'event',
            data: event
        };

        this.clients.forEach(client => {
            if (
                client.readyState === WebSocket.OPEN &&
                (client.clientId === event.client_id || // Cliente específico
                client.subscriptions?.has('all_events') || // Suscrito a todos los eventos
                client.subscriptions?.has(`client_${event.client_id}`)) // Suscrito a eventos del cliente
            ) {
                this.send(client, message);
            }
        });
    }

    private send(ws: WebSocket, data: any) {
        ws.send(JSON.stringify(data));
    }

    private sendError(ws: WebSocket, message: string) {
        this.send(ws, {
            type: 'error',
            message
        });
    }

    public notifyEventProcessed(event: Event): void {
        this.broadcastEvent({
            ...event,
            metadata: {
                ...event.metadata,
                status: 'processed',
                processed_at: new Date()
            }
        });
    }

    public notifyEventFailed(event: Event, errorMessage: string): void {
        this.broadcastEvent({
            ...event,
            metadata: {
                ...event.metadata,
                status: 'failed',
                error: errorMessage,
                failed_at: new Date()
            }
        });
    }
} 