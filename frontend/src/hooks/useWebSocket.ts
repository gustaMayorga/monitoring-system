import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    reconnectAttempts = 3,
    reconnectInterval = 5000,
    onOpen,
    onClose,
    onError,
  } = options;

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const websocket = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimeoutId = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      websocket.current = new WebSocket(url);
      
      websocket.current.onopen = () => {
        setReadyState(WebSocket.OPEN);
        reconnectCount.current = 0;
        onOpen?.();
      };

      websocket.current.onclose = () => {
        setReadyState(WebSocket.CLOSED);
        onClose?.();

        if (reconnectCount.current < reconnectAttempts) {
          reconnectTimeoutId.current = setTimeout(() => {
            reconnectCount.current += 1;
            connect();
          }, reconnectInterval);
        }
      };

      websocket.current.onerror = (error) => {
        onError?.(error);
      };

      websocket.current.onmessage = (message) => {
        setLastMessage(message);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [url, reconnectAttempts, reconnectInterval, onOpen, onClose, onError]);

  useEffect(() => {
    connect();

    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: string | ArrayBufferLike | Blob | ArrayBufferView) => {
    if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
      websocket.current.send(message);
    }
  }, []);

  return {
    lastMessage,
    readyState,
    sendMessage,
  };
}