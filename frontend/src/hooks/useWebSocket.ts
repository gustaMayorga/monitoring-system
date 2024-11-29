import { useEffect, useRef, useCallback } from 'react';
import { Event } from '../types/event';

interface WebSocketMessage {
    type: string;
    data?: any;
    error?: string;
    channel?: string;
}

interface UseWebSocketOptions {
    onEvent?: (event: Event) => void;
    onError?: (error: string) => void;
    clientId?: number;
    autoReconnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:3003'}/ws`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket conectado a:', wsUrl);
            if (options.clientId) {
                ws.send(JSON.stringify({
                    type: 'authenticate',
                    clientId: options.clientId
                }));
            }
        };

        ws.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                
                switch (message.type) {
                    case 'event':
                        options.onEvent?.(message.data);
                        break;
                    case 'error':
                        options.onError?.(message.error || 'Error desconocido');
                        break;
                    case 'authenticated':
                        console.log('Cliente autenticado:', message.data);
                        break;
                    default:
                        console.log('Mensaje no manejado:', message);
                }
            } catch (error) {
                console.error('Error al procesar mensaje:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('Error de WebSocket:', error);
            options.onError?.('Error de conexión');
        };

        ws.onclose = () => {
            console.log('WebSocket desconectado');
            wsRef.current = null;

            if (options.autoReconnect) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('Intentando reconexión...');
                    connect();
                }, 5000);
            }
        };

        wsRef.current = ws;
    }, [options.clientId, options.onEvent, options.onError, options.autoReconnect]);

    const subscribe = useCallback((channel: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'subscribe',
                channel
            }));
        }
    }, []);

    const unsubscribe = useCallback((channel: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'unsubscribe',
                channel
            }));
        }
    }, []);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        wsRef.current?.close();
    }, []);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        subscribe,
        unsubscribe,
        disconnect,
        reconnect: connect
    };
}; 