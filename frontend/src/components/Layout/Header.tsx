import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <h1 className="text-xl font-bold">Sistema de Monitoreo</h1>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={handleLogout}
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}; 