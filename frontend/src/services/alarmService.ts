import axios from 'axios';
import { AlarmPanel } from '../types/alarm';

export class AlarmService {
    private baseUrl: string;

    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    async getPanels(): Promise<AlarmPanel[]> {
        const response = await axios.get(`${this.baseUrl}/alarm-panels`);
        return response.data.data;
    }

    async getPanel(id: number): Promise<AlarmPanel> {
        const response = await axios.get(`${this.baseUrl}/alarm-panels/${id}`);
        return response.data.data;
    }

    async createPanel(panel: Omit<AlarmPanel, 'id'>): Promise<AlarmPanel> {
        const response = await axios.post(`${this.baseUrl}/alarm-panels`, panel);
        return response.data.data;
    }

    async updatePanel(id: number, panel: Partial<AlarmPanel>): Promise<AlarmPanel> {
        const response = await axios.put(`${this.baseUrl}/alarm-panels/${id}`, panel);
        return response.data.data;
    }

    async deletePanel(id: number): Promise<void> {
        await axios.delete(`${this.baseUrl}/alarm-panels/${id}`);
    }

    async getEvents(panelId: number, startDate: Date, endDate: Date): Promise<any[]> {
        const response = await axios.get(`${this.baseUrl}/alarm-panels/${panelId}/events`, {
            params: {
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            }
        });
        return response.data.data;
    }

    async armPanel(panelId: number, partitions: number[]): Promise<void> {
        await axios.post(`${this.baseUrl}/alarm-panels/${panelId}/arm`, { partitions });
    }

    async disarmPanel(panelId: number, partitions: number[]): Promise<void> {
        await axios.post(`${this.baseUrl}/alarm-panels/${panelId}/disarm`, { partitions });
    }
} 