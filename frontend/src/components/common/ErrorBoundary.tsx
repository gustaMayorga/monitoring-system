import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error no capturado:', error);
        console.error('Error info:', errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="max-w-xl p-8 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-red-600">¡Ups! Algo salió mal</h1>
                        <p className="mb-8 text-gray-600">
                            Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Recargar página
                        </button>
                        {this.state.error && (
                            <pre className="mt-4 p-4 bg-gray-800 text-white rounded text-left overflow-auto">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
} 