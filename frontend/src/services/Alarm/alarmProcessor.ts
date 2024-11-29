// src/services/alarm/alarmProcessor.ts
interface AlarmEvent {
    raw: string;
    protocol: 'CID' | 'SIA';
    accountNumber: string;
    eventCode: string;
    zone: string;
    partition: string;
    timestamp: Date;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }
  
  class AlarmProcessor {
    // Mapeo de códigos CID a descripciones
    private static CID_CODES: Record<string, string> = {
      '1110': 'Alarma de Fuego',
      '1120': 'Pánico',
      '1130': 'Robo',
      '1301': 'Pérdida de AC',
      '1381': 'Pérdida de Supervisión',
      '3441': 'Armado',
      '1401': 'Desarmado por Usuario',
      // ... más códigos
    };
  
    // Mapeo de códigos SIA a descripciones
    private static SIA_CODES: Record<string, string> = {
      'BA': 'Alarma de Robo',
      'FA': 'Alarma de Fuego',
      'PA': 'Alarma de Pánico',
      'AT': 'Problema de AC',
      'RP': 'Prueba Automática',
      // ... más códigos
    };
  
    processCIDEvent(raw: string): AlarmEvent | null {
      try {
        // Formato típico CID: ACCT MT QXYZ GG CCC S
        const match = raw.match(/(\d{4})(\d{2})(\d{4})(\d{2})(\d{3})(\d)/);
        if (!match) return null;
  
        const [, accountNumber, , eventCode, partition, zone] = match;
        
        return {
          raw,
          protocol: 'CID',
          accountNumber,
          eventCode,
          zone,
          partition,
          timestamp: new Date(),
          priority: this.determinePriority(eventCode),
          description: AlarmProcessor.CID_CODES[eventCode] || 'Evento Desconocido'
        };
      } catch (error) {
        console.error('Error processing CID event:', error);
        return null;
      }
    }
  
    processSIAEvent(raw: string): AlarmEvent | null {
      try {
        // Formato típico SIA: #AAAA|Nri/FCCC/ZONE
        const match = raw.match(/#(\w{4})\|Nri\/(\w{2,3})\/(\d+)/);
        if (!match) return null;
  
        const [, accountNumber, eventCode, zone] = match;
  
        return {
          raw,
          protocol: 'SIA',
          accountNumber,
          eventCode,
          zone,
          partition: '1', // SIA puede no incluir partición
          timestamp: new Date(),
          priority: this.determinePriority(eventCode),
          description: AlarmProcessor.SIA_CODES[eventCode] || 'Evento Desconocido'
        };
      } catch (error) {
        console.error('Error processing SIA event:', error);
        return null;
      }
    }
  
    private determinePriority(eventCode: string): 'high' | 'medium' | 'low' {
      // Códigos de alta prioridad
      const highPriority = ['1110', '1120', '1130', 'FA', 'PA', 'BA'];
      // Códigos de media prioridad
      const mediumPriority = ['1301', '1381', 'AT'];
  
      if (highPriority.some(code => eventCode.includes(code))) return 'high';
      if (mediumPriority.some(code => eventCode.includes(code))) return 'medium';
      return 'low';
    }
  }
  
  export const alarmProcessor = new AlarmProcessor();
  
  // src/services/alarm/alarmReceiver.ts
  class AlarmReceiver {
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 5;
    
    constructor(private url: string) {}
  
    connect() {
      this.socket = new WebSocket(this.url);
  
      this.socket.onopen = () => {
        console.log('Conexión establecida con receptor de alarmas');
        this.reconnectAttempts = 0;
      };
  
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.processAlarmEvent(data);
        } catch (error) {
          console.error('Error processing alarm message:', error);
        }
      };
  
      this.socket.onclose = () => {
        console.log('Conexión cerrada');
        this.attemptReconnect();
      };
  
      this.socket.onerror = (error) => {
        console.error('Error en conexión de alarmas:', error);
      };
    }
  
    private processAlarmEvent(data: any) {
      const event = data.protocol === 'CID' 
        ? alarmProcessor.processCIDEvent(data.raw)
        : alarmProcessor.processSIAEvent(data.raw);
  
      if (event) {
        // Emitir evento para el sistema
        const customEvent = new CustomEvent('alarm-event', {
          detail: event
        });
        window.dispatchEvent(customEvent);
      }
    }
  
    private attemptReconnect() {
      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        console.error('Máximo número de intentos de reconexión alcanzado');
        return;
      }
  
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, 5000 * Math.pow(2, this.reconnectAttempts));
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  }
  
  