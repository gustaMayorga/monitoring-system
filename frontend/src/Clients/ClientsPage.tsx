import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/config/api';

interface Client {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as const,
  });

  // Cargar clientes
  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await apiService.clients.getAll();
      setClients(data.items || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Crear o actualizar cliente
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedClient) {
        await apiService.clients.update(selectedClient.id, formData);
        toast.success('Cliente actualizado con éxito');
      } else {
        await apiService.clients.create(formData);
        toast.success('Cliente creado con éxito');
      }
      setIsDialogOpen(false);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error instanceof Error ? error.message : 'Error al guardar el cliente');
    }
  };

  // Eliminar cliente
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      await apiService.clients.delete(id);
      toast.success('Cliente eliminado con éxito');
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Error al eliminar el cliente');
    }
  };

  // Editar cliente
  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      document: client.document,
      email: client.email,
      phone: client.phone,
      address: client.address,
      status: client.status,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      document: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
    });
    setSelectedClient(null);
  };

  // Resto del código del componente permanece igual...

  // En la función loadClients
  const loadClients = async () => {
    try {
      setLoading(true);
      console.log('Intentando cargar clientes...'); // Añade este log
      const data = await apiService.clients.getAll();
      console.log('Respuesta de la API (loadClients):', data); // Añade este log
      setClients(data.items || []);
    } catch (error) {
      console.error('Error loading clients:', error); // Este ya existe
      toast.error('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // En la función handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Datos del formulario a enviar:', formData); // Añade este log
      if (selectedClient) {
        console.log('Actualizando cliente:', selectedClient.id); // Añade este log
        await apiService.clients.update(selectedClient.id, formData);
        toast.success('Cliente actualizado con éxito');
      } else {
        console.log('Creando nuevo cliente'); // Añade este log
        await apiService.clients.create(formData);
        toast.success('Cliente creado con éxito');
      }
      setIsDialogOpen(false);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error en handleSubmit:', error); // Modifica este log
      toast.error(error instanceof Error ? error.message : 'Error al guardar el cliente');
    }
  };

  // En la función handleDelete
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente?')) return;

    try {
      console.log('Intentando eliminar cliente:', id); // Añade este log
      await apiService.clients.delete(id);
      console.log('Cliente eliminado exitosamente:', id); // Añade este log
      toast.success('Cliente eliminado con éxito');
      loadClients();
    } catch (error) {
      console.error('Error al eliminar cliente:', error); // Modifica este log
      toast.error('Error al eliminar el cliente');
    }
  };