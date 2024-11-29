// src/services/clientService.ts
import api from './api'

export interface Client {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  is_active: boolean
}

export interface ClientCreate {
  name: string
  email: string
  phone?: string
  address?: string
}

export const clientService = {
  create: async (client: ClientCreate) => {
    const response = await api.post<Client>('/client/', client)
    return response.data
  },

  list: async () => {
    const response = await api.get<Client[]>('/client/')
    return response.data
  },

  update: async (id: number, client: ClientCreate) => {
    const response = await api.put<Client>(`/client/${id}`, client)
    return response.data
  },

  delete: async (id: number) => {
    await api.delete(`/client/${id}`)
  }
}