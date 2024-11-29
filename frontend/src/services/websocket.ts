// src/services/websocket.ts
import { EventEmitter } from 'events';

interface WebSocketMessage {
  type: string;
  data: any;
}

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 5000;
  private pingInterval: NodeJS.Timer | null = null;

  constructor(private baseUrl: string = 'ws://localhost:8000/ws') {
    super();
  }

  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${this.baseUrl}?token=${token}`);

    this.ws.onopen = () => {
      console.log('WebSocket conectado');
      this.reconnectAttempts = 0;
      this.startPingInterval();
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket desconectado');
      this.stopPingInterval();
      this.emit('disconnected');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  private handleMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'alarm':
        this.emit('alarm', message.data);
        break;
      case 'camera_event':
        this.emit('cameraEvent', message.data);
        break;
      case 'notification':
        this.emit('notification', message.data);
        break;
      case 'status_update':
        this.emit('statusUpdate', message.data);
        break;
      default:
        console.warn('Unhandled message type:', message.type);
    }
  }

  private startPingInterval() {
    this.pingInterval = setInterval(() => {
      this.send({ type: 'ping', data: null });
    }, 30000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(localStorage.getItem('token') || '');
    }, this.reconnectTimeout);
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopPingInterval();
  }
}

export const wsService = new WebSocketService();