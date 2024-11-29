// src/services/events.service.ts
export const eventsService = {
    getEvents: async (params?: any) => {
      const response = await api.get('/events', { params });
      return response.data;
    },
  
    createEvent: async (data: any) => {
      const response = await api.post('/events', data);
      return response.data;
    },
  
    updateEvent: async (id: string, data: any) => {
      const response = await api.put(`/events/${id}`, data);
      return response.data;
    }
  };