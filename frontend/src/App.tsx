// src/App.tsx

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/Dashboard';
import { CameraList } from './components/cameras/CameraList';
import { EventList } from './components/events/EventList';
import { RoleList } from './components/roles/RoleList';
import { ClientList } from './components/clients/ClientList';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? (
              <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sistema de Monitoreo
                  </h2>
                  <p className="mt-2 text-center text-sm text-gray-600">
                    Inicia sesión para continuar
                  </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                  <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Login onLogin={handleLogin} />
                  </div>
                </div>
              </div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="cameras" element={<CameraList />} />
          <Route path="events" element={<EventList />} />
          <Route path="roles" element={<RoleList />} />
          <Route path="clients" element={<ClientList />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;