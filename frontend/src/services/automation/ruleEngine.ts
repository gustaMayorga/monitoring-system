// src/services/automation/ruleEngine.ts
interface Condition {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
    value: any;
    additionalValue?: any; // Para el operador 'between'
  }
  
  interface Action {
    type: 'notification' | 'email' | 'sms' | 'webhook' | 'camera_record' | 'output_trigger';
    config: {
      template?: string;
      recipients?: string[];
      duration?: number;
      url?: string;
      outputId?: string;
      cameraId?: string;
      [key: string]: any;
    };
  }
  
  interface Rule {
    id: string;
    name: string;
    description: string;
    eventType: 'alarm' | 'camera' | 'system';
    conditions: Condition[];
    actions: Action[];
    enabled: boolean;
    priority: number;
    schedule?: {
      days: number[]; // 0-6 (domingo-sábado)
      startTime: string; // HH:mm
      endTime: string; // HH:mm
    };
  }
  
  class RuleEngine {
    private rules: Rule[] = [];
  
    constructor() {
      this.loadRules();
    }
  
    private async loadRules() {
      try {
        // Cargar reglas desde el backend
        const response = await fetch('/api/automation/rules');
        this.rules = await response.json();
      } catch (error) {
        console.error('Error loading rules:', error);
        // Cargar reglas por defecto
        this.rules = this.getDefaultRules();
      }
    }
  
    private getDefaultRules(): Rule[] {
      return [
        {
          id: '1',
          name: 'Alarma de Intrusión',
          description: 'Notificar cuando se detecte una intrusión',
          eventType: 'alarm',
          conditions: [
            {
              field: 'eventCode',
              operator: 'equals',
              value: '1130'
            }
          ],
          actions: [
            {
              type: 'notification',
              config: {
                template: 'intrusion_alert',
                priority: 'high'
              }
            },
            {
              type: 'camera_record',
              config: {
                duration: 300, // 5 minutos
                preBuffer: 30 // 30 segundos antes
              }
            }
          ],
          enabled: true,
          priority: 1
        }
      ];
    }
  
    private evaluateCondition(condition: Condition, event: any): boolean {
      const eventValue = event[condition.field];
  
      switch (condition.operator) {
        case 'equals':
          return eventValue === condition.value;
        case 'contains':
          return eventValue.includes(condition.value);
        case 'greaterThan':
          return eventValue > condition.value;
        case 'lessThan':
          return eventValue < condition.value;
        case 'between':
          return eventValue >= condition.value && 
                 eventValue <= condition.additionalValue;
        default:
          return false;
      }
    }
  
    private isRuleScheduleValid(rule: Rule): boolean {
      if (!rule.schedule) return true;
  
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();
  
      const [startHour, startMinute] = rule.schedule.startTime.split(':');
      const [endHour, endMinute] = rule.schedule.endTime.split(':');
      
      const startTimeMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
      const endTimeMinutes = parseInt(endHour) * 60 + parseInt(endMinute);
  
      return rule.schedule.days.includes(currentDay) &&
             currentTime >= startTimeMinutes &&
             currentTime <= endTimeMinutes;
    }
  
    private async executeAction(action: Action, event: any) {
      try {
        switch (action.type) {
          case 'notification':
            await this.sendNotification(action.config, event);
            break;
          case 'email':
            await this.sendEmail(action.config, event);
            break;
          case 'sms':
            await this.sendSMS(action.config, event);
            break;
          case 'webhook':
            await this.triggerWebhook(action.config, event);
            break;
          case 'camera_record':
            await this.startCameraRecording(action.config, event);
            break;
          case 'output_trigger':
            await this.triggerOutput(action.config, event);
            break;
        }
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
  
    async processEvent(event: any) {
      const applicableRules = this.rules
        .filter(rule => rule.enabled && 
                rule.eventType === event.type &&
                this.isRuleScheduleValid(rule))
        .sort((a, b) => a.priority - b.priority);
  
      for (const rule of applicableRules) {
        const conditionsMet = rule.conditions.every(condition => 
          this.evaluateCondition(condition, event)
        );
  
        if (conditionsMet) {
          console.log(`Rule "${rule.name}" triggered for event:`, event);
          for (const action of rule.actions) {
            await this.executeAction(action, event);
          }
        }
      }
    }
  
    // Implementación de acciones
    private async sendNotification(config: any, event: any) {
      const notification = {
        title: config.template === 'intrusion_alert' ? 
          '¡Alerta de Intrusión!' : 'Notificación del Sistema',
        message: `Se ha detectado un evento en ${event.location || 'ubicación desconocida'}`,
        priority: config.priority,
        timestamp: new Date(),
        data: event
      };
  
      // Emitir evento de notificación
      window.dispatchEvent(new CustomEvent('system-notification', {
        detail: notification
      }));
    }
  
    private async sendEmail(config: any, event: any) {
      // Implementar envío de email
    }
  
    private async sendSMS(config: any, event: any) {
      // Implementar envío de SMS
    }
  
    private async triggerWebhook(config: any, event: any) {
      try {
        await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });
      } catch (error) {
        console.error('Error triggering webhook:', error);
      }
    }
  
    private async startCameraRecording(config: any, event: any) {
      try {
        const response = await fetch(`/api/cameras/${config.cameraId}/record`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            duration: config.duration,
            preBuffer: config.preBuffer,
            eventId: event.id
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to start camera recording');
        }
      } catch (error) {
        console.error('Error starting camera recording:', error);
      }
    }
  
    private async triggerOutput(config: any, event: any) {
      try {
        await fetch(`/api/outputs/${config.outputId}/trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            state: true,
            duration: config.duration
          })
        });
      } catch (error) {
        console.error('Error triggering output:', error);
      }
    }
  }
  
  export const ruleEngine = new RuleEngine();