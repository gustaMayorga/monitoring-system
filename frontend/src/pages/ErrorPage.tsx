import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();
    
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ¡Ups! Algo salió mal
                    </h1>
                    <p className="text-gray-600 mb-4">
                        {isRouteErrorResponse(error) 
                            ? `${error.status} - ${error.statusText}`
                            : 'Ha ocurrido un error inesperado'}
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    );
} 