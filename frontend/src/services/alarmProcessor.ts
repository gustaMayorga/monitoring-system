// Tipos de eventos de alarma
export type ContactIDEvent = {
    accountNumber: string;
    messageType: '18' | '98'; // New Event | Restore
    qualifier: '1' | '3'; // New Event/Restore
    eventCode: string;
    partitionNumber: string;
    zoneNumber: string;
    checksum: string;
  };
  
  export type SIAEvent = {
    accountNumber: string;
    messageType: string; // BA, HA, FA, etc.
    data: {
      timestamp?: string;
      zone?: string;
      user?: string;
      area?: string;
    };
  };
  
  class AlarmProcessor {
    // Mapeo de códigos CID a descripciones
    private static CID_CODES: Record<string, string> = {
      '1110': 'Alarma de Fuego',
      '1120': 'Pánico',
      '1130': 'Robo',
      '1301': 'Pérdida de AC',
      '1302': 'Batería Baja',
      '1401': 'Desarme',
      '1406': 'Cancelación de Alarma',
      '3110': 'Restauración de Fuego',
      '3130': 'Restauración de Robo',
      '3301': 'Restauración de AC',
      '3302': 'Restauración de Batería',
      // ... más códigos según necesidad
    };
  
    // Mapeo de códigos SIA a descripciones
    private static SIA_CODES: Record<string, string> = {
      'BA': 'Alarma de Robo',
      'BR': 'Restauración de Robo',
      'FA': 'Alarma de Fuego',
      'FR': 'Restauración de Fuego',
      'HA': 'Atraco',
      'PA': 'Pánico',
      'AT': 'Problema de AC',
      'AR': 'Restauración de AC',
      // ... más códigos según necesidad
    };
  
    // Procesar evento Contact ID
    public static parseContactID(rawData: string): ContactIDEvent | null {
      try {
        // Formato típico: ACCT 18 1 110 01 001
        const match = rawData.match(/(\d{4})\s?(\d{2})\s?(\d{1})\s?(\d{3})\s?(\d{2})\s?(\d{3})/);
        
        if (!match) return null;
  
        const [_, accountNumber, messageType, qualifier, eventCode, partitionNumber, zoneNumber] = match;
  
        return {
          accountNumber,
          messageType: messageType as '18' | '98',
          qualifier: qualifier as '1' | '3',
          eventCode,
          partitionNumber,
          zoneNumber,
          checksum: this.calculateCIDChecksum(rawData)
        };
      } catch (error) {
        console.error('Error parsing Contact ID:', error);
        return null;
      }
    }
  
    // Procesar evento SIA
    public static parseSIA(rawData: string): SIAEvent | null {
      try {
        // Formato típico: #AAAA|NK|BA001
        const match = rawData.match(/#(\w+)\|(\w+)\|(\w+)(\d+)(.*)/);
        
        if (!match) return null;
  
        const [_, accountNumber, _, messageType, zoneNumber, additionalData] = match;
  
        return {
          accountNumber,
          messageType,
          data: {
            zone: zoneNumber,
            ...this.parseSIAAdditionalData(additionalData)
          }
        };
      } catch (error) {
        console.error('Error parsing SIA:', error);
        return null;
      }
    }
  
    // Obtener descripción del evento
    public static getEventDescription(event: ContactIDEvent | SIAEvent): string {
      if ('eventCode' in event) {
        // Contact ID
        const baseDescription = this.CID_CODES[event.eventCode] || 'Evento Desconocido';
        return `${baseDescription} - Zona ${event.zoneNumber}`;
      } else {
        // SIA
        const baseDescription = this.SIA_CODES[event.messageType] || 'Evento Desconocido';
        return `${baseDescription}${event.data.zone ? ` - Zona ${event.data.zone}` : ''}`;
      }
    }
  
    // Calcular prioridad del evento
    public static calculateEventPriority(event: ContactIDEvent | SIAEvent): 'low' | 'medium' | 'high' | 'critical' {
      if ('eventCode' in event) {
        // Contact ID
        const code = parseInt(event.eventCode);
        if (code >= 1100 && code <= 1123) return 'critical'; // Emergencias
        if (code >= 1130 && code <= 1155) return 'high'; // Robos
        if (code >= 1300 && code <= 1383) return 'medium'; // Problemas de sistema
        return 'low';
      } else {
        // SIA
        const type = event.messageType.charAt(0);
        switch (type) {
          case 'F': // Fuego
          case 'P': // Pánico
            return 'critical';
          case 'B': // Robo
          case 'H': // Atraco
            return 'high';
          case 'T': // Problema
          case 'S': // Supervisión
            return 'medium';
          default:
            return 'low';
        }
      }
    }
  
    private static calculateCIDChecksum(data: string): string {
      // Implementar cálculo de checksum según especificación
      return '00'; // Simplificado para el ejemplo
    }
  
    private static parseSIAAdditionalData(data: string): Record<string, string> {
      const result: Record<string, string> = {};
      // Procesar datos adicionales del formato SIA
      // Ejemplo: /TS18:23:45/UI001
      const matches = data.match(/\/(\w{2})([^/]+)/g) || [];
      
      matches.forEach(match => {
        const [_, key, value] = match.match(/\/(\w{2})(.*)/) || [];
        switch (key) {
          case 'TS':
            result.timestamp = value;
            break;
          case 'UI':
            result.user = value;
            break;
          case 'AR':
            result.area = value;
            break;
        }
      });
  
      return result;
    }
  }
  
  export default AlarmProcessor;