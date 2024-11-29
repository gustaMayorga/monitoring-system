// src/services/reports.service.ts
export const reportsService = {
    generateReport: async (type: string, params?: any) => {
      const response = await api.post(`/reports/${type}`, params);
      return response.data;
    },
  
    getReports: async (params?: any) => {
      const response = await api.get('/reports', { params });
      return response.data;
    },
  
    downloadReport: async (id: string) => {
      const response = await api.get(`/reports/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    }
  };