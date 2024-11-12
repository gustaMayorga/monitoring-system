import EventEmitter from 'events';

interface MockDevice {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
}

interface MockEvent {
  timestamp: string;
  deviceId: string;
  deviceName: string;
  type: string;
  details?: any;
}

class MockMonitoringService extends EventEmitter {
  private devices: MockDevice[] = [
    {
      id: 'cam1',
      name: 'Cámara Principal',
      type: 'camera',
      status: 'active',
      location: 'Entrada'
    },
    {
      id: 'alarm1',
      name: 'Alarma DSC',
      type: 'alarm',
      status: 'armed',
      location: 'Central'
    }
  ];

  private eventTypes = {
    camera: ['motion', 'person', 'vehicle'],
    alarm: ['zone_open', 'zone_alarm', 'arm', 'disarm']
  };

  private isSimulating = false;
  private simulationInterval: NodeJS.Timer | null = null;

  constructor() {
    super();
  }

  startSimulation() {
    if (!this.isSimulating) {
      this.isSimulating = true;
      this.simulationInterval = setInterval(() => {
        this.generateRandomEvent();
      }, 5000);
    }
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.isSimulating = false;
    }
  }

  private generateRandomEvent() {
    const device = this.devices[Math.floor(Math.random() * this.devices.length)];
    const eventTypes = this.eventTypes[device.type as keyof typeof this.eventTypes];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    const event: MockEvent = {
      timestamp: new Date().toISOString(),
      deviceId: device.id,
      deviceName: device.name,
      type: eventType,
      details: this.generateEventDetails(device.type, eventType)
    };

    this.emit('event', event);
  }

  private generateEventDetails(deviceType: string, eventType: string) {
    if (deviceType === 'camera') {
      return {
        confidence: Math.random() * 100,
        bbox: {
          x: Math.random() * 100,
          y: Math.random() * 100,
          width: Math.random() * 50,
          height: Math.random() * 50
        }
      };
    } else if (deviceType === 'alarm') {
      return {
        zone: Math.floor(Math.random() * 8) + 1,
        user: eventType.includes('arm') ? Math.floor(Math.random() * 10) + 1 : undefined
      };
    }
    return {};
  }

  generateManualEvent(type: 'camera' | 'alarm', eventType?: string) {
    const device = this.devices.find(d => d.type === type);
    if (!device) return;

    const types = this.eventTypes[type];
    const selectedEventType = eventType || types[Math.floor(Math.random() * types.length)];

    const event: MockEvent = {
      timestamp: new Date().toISOString(),
      deviceId: device.id,
      deviceName: device.name,
      type: selectedEventType,
      details: this.generateEventDetails(type, selectedEventType)
    };

    this.emit('event', event);
  }

  getDevices() {
    return [...this.devices];
  }

  getStatus() {
    return {
      isSimulating: this.isSimulating,
      deviceCount: this.devices.length,
      activeDevices: this.devices.filter(d => d.status === 'active').length
    };
  }
}

export const mockService = new MockMonitoringService();
export default mockService;