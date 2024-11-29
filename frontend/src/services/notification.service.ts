// src/services/notifications.service.ts
export const notificationsService = {
    getNotifications: async () => {
      const response = await api.get('/notifications');
      return response.data;
    },
  
    markAsRead: async (id: string) => {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    },
  
    updatePreferences: async (preferences: any) => {
      const response = await api.put('/notifications/preferences', preferences);
      return response.data;
    }
  };

  