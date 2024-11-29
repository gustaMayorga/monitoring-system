// src/pages/Settings/SettingsPage.tsx
import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SettingsPage = () => {
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Mi Empresa de Seguridad',
    email: 'contacto@empresa.com',
    phone: '555-0123'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false
  });

  return (
    <div className="p-6">
      <div className="grid gap-6">
        {/* Configuración General */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre de la Empresa
                </label>
                <Input 
                  value={generalSettings.companyName}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    companyName: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email de Contacto
                </label>
                <Input 
                  type="email"
                  value={generalSettings.email}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    email: e.target.value
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Teléfono de Contacto
                </label>
                <Input 
                  value={generalSettings.phone}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    phone: e.target.value
                  })}
                />
              </div>
              <Button>Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificaciones por Email</h3>
                  <p className="text-sm text-gray-500">
                    Recibir alertas por email
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    emailNotifications: e.target.checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificaciones SMS</h3>
                  <p className="text-sm text-gray-500">
                    Recibir alertas por SMS
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={notificationSettings.smsNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    smsNotifications: e.target.checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificaciones Push</h3>
                  <p className="text-sm text-gray-500">
                    Recibir notificaciones push en el navegador
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) => setNotificationSettings({
                    ...notificationSettings,
                    pushNotifications: e.target.checked
                  })}
                />
              </div>
              <Button>Guardar Configuración</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;