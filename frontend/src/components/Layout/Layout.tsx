import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { NotificationCenter } from '../notifications/NotificationCenter';

export const Layout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Overlay para móviles */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar móvil */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:hidden
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                        className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                </div>
                <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
            </div>

            {/* Sidebar desktop */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <Sidebar />
                </div>
            </div>

            {/* Contenido principal */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow lg:hidden">
                    <button
                        className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menú"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    
                    <div className="flex-1 flex justify-end px-4">
                        <NotificationCenter />
                    </div>
                </div>

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}; 