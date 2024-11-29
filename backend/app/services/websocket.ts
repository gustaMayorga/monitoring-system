// src/services/websocket.ts
type WebSocketMessage = {
    type: string;
    data: any;
  };
  
  type WebSocketEventMap = {
    message: (data: any) => void;
    connected: () => void;
    disconnected: () => void;
    error: (error: any) => void;
  };
  
  class WebSocketService {
    private ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout = 5000;
    private eventHandlers: Partial<{[K in keyof WebSocketEventMap]: WebSocketEventMap[K][]}>  = {};
  
    constructor(private baseUrl: string) {}
  
    connect(clientId: string, token: string) {
      if (this.ws?.readyState === WebSocket.OPEN) return;
  
      this.ws = new WebSocket(`${this.baseUrl}/ws/${clientId}?token=${token}`);
  
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
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
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.attemptReconnect(clientId, token);
      };
  
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    }
  
    private handleMessage(message: WebSocketMessage) {
      this.emit('message', message);
    }
  
    private attemptReconnect(clientId: string, token: string) {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        return;
      }
  
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect(clientId, token);
      }, this.reconnectTimeout * Math.pow(2, this.reconnectAttempts));
    }
  
    on<K extends keyof WebSocketEventMap>(event: K, handler: WebSocketEventMap[K]) {
      if (!this.eventHandlers[event]) {
        this.eventHandlers[event] = [];
      }
      this.eventHandlers[event]?.push(handler);
    }
  
    off<K extends keyof WebSocketEventMap>(event: K, handler: WebSocketEventMap[K]) {
      if (!this.eventHandlers[event]) return;
      this.eventHandlers[event] = this.eventHandlers[event]?.filter(h => h !== handler);
    }
  
    private emit<K extends keyof WebSocketEventMap>(event: K, data?: any) {
      this.eventHandlers[event]?.forEach(handler => handler(data));
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
    }
  }
  
  export const wsService = new WebSocketService(import.meta.env.VITE_WS_URL || 'ws://localhost:8000');