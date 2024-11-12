// Tipos
export interface Client {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface ClientCreate {
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  status?: 'active' | 'inactive';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Configuración
export const API_URL = 'http://localhost:8000/api';

// Servicio API
export const apiService = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    try {
      console.log('Making request to:', url, {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        mode: 'cors',
      });

      console.log('Response status:', response.status);

      // Manejar respuestas 204 (No Content)
      if (response.status === 204) {
        return null as T;
      }

      // Manejar errores
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `Error HTTP: ${response.status} ${response.statusText}`
        }));
        throw new Error(errorData.detail || 'Error en la solicitud');
      }

      // Manejar respuestas exitosas
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  clients: {
    // Obtener todos los clientes
    async getAll(): Promise<Client[]> {
      return await apiService.request<Client[]>('/clients');
    },

    // Obtener un cliente por ID
    async getById(id: string): Promise<Client> {
      return await apiService.request<Client>(`/clients/${id}`);
    },

    // Crear un nuevo cliente
    async create(data: ClientCreate): Promise<Client> {
      return await apiService.request<Client>('/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    // Actualizar un cliente
    async update(id: string, data: Partial<ClientCreate>): Promise<Client> {
      return await apiService.request<Client>(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    // Eliminar un cliente
    async delete(id: string): Promise<void> {
      return await apiService.request<void>(`/clients/${id}`, {
        method: 'DELETE',
      });
    },

    // Buscar clientes
    async search(query: string): Promise<Client[]> {
      return await apiService.request<Client[]>(`/clients/search?q=${encodeURIComponent(query)}`);
    },
  },

  // Función de utilidad para manejar errores
  handleError(error: any): never {
    console.error('API Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error desconocido en la API');
  },

  // Función de utilidad para validar respuestas
  validateResponse<T>(response: any): T {
    if (!response) {
      throw new Error('Respuesta vacía del servidor');
    }
    return response as T;
  }
};

// Exportar por defecto
export default apiService;

// Tipos de error personalizados
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Helpers
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError;
};

// Configuración de interceptores
const setupInterceptors = () => {
  // Aquí podrías agregar interceptores para token de autenticación, refresh token, etc.
  console.log('API Service initialized');
};

// Inicializar configuración
setupInterceptors();