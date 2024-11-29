// src/pages/Companies/CompaniesPage.tsx
import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Company {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      name: "Empresa A",
      address: "Calle Principal 123",
      phone: "555-0123",
      email: "contacto@empresaa.com",
      status: "active"
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Empresas</CardTitle>
          <Button>Nueva Empresa</Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Buscar empresas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nombre</th>
                  <th className="text-left p-2">Dirección</th>
                  <th className="text-left p-2">Teléfono</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Estado</th>
                  <th className="text-left p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b">
                    <td className="p-2">{company.name}</td>
                    <td className="p-2">{company.address}</td>
                    <td className="p-2">{company.phone}</td>
                    <td className="p-2">{company.email}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        company.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                    <td className="p-2">
                      <Button variant="outline" size="sm" className="mr-2">
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm">
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompaniesPage;