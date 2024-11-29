// src/components/ErrorBoundary.tsx
import { useRouteError } from 'react-router-dom';

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-4">Oops!</h1>
        <p className="text-center text-gray-600">
          {error instanceof Error ? error.message : 'Un error inesperado ha ocurrido.'}
        </p>
      </div>
    </div>
  );
}