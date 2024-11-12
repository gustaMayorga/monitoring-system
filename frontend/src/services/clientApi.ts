import { apiService, Client, ClientCreate } from './api';

export const clientApi = {
  // Listar clientes con paginación y filtros
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    const url = `/clients?${queryParams.toString()}`;
    return await apiService.request<{
      items: Client[];
      total: number;
      page: number;
      pages: number;
    }>(url);
  },

  // Crear cliente
  async create(data: ClientCreate) {
    return await apiService.request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Actualizar cliente
  async update(id: string, data: Partial<ClientCreate>) {
    return await apiService.request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Eliminar cliente
  async delete(id: string) {
    return await apiService.request<void>(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener un cliente por ID
  async getById(id: string) {
    return await apiService.request<Client>(`/clients/${id}`);
  },

  // Buscar clientes
  async search(query: string) {
    return await apiService.request<Client[]>(`/clients/search?q=${encodeURIComponent(query)}`);
  },

  // Cambiar estado de cliente
  async toggleStatus(id: string, status: 'active' | 'inactive') {
    return await apiService.request<Client>(`/clients/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export default clientApi;