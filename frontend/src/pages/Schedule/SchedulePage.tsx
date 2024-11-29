// src/pages/Schedule/SchedulePage.tsx
import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Task {
  id: number;
  title: string;
  client: string;
  assignedTo: string;
  datetime: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

const SchedulePage = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: "Instalación de Cámaras",
      client: "Empresa A",
      assignedTo: "Juan Pérez",
      datetime: "2024-11-14 09:00",
      status: "pending",
      priority: "high"
    }
  ]);

  return (
    <div className="p-6">
      <div className="grid gap-6">
        {/* Vista de Calendario/Agenda aquí */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Agenda</CardTitle>
            <div className="flex gap-2">
              <Button>Nueva Tarea</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Lista de tareas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tareas Pendientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map(task => (
                      <div key={task.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            task.priority === 'high' 
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <p>Cliente: {task.client}</p>
                          <p>Asignado a: {task.assignedTo}</p>
                          <p>Fecha: {new Date(task.datetime).toLocaleString()}</p>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">Completar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calendario */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Calendario</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Aquí irá el componente de calendario */}
                  <div className="h-96 border rounded-lg flex items-center justify-center text-gray-500">
                    Calendario en desarrollo
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SchedulePage;