import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();
  
  let errorMessage: string;
  let errorTitle: string;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.data?.message || error.statusText;
    errorTitle = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorTitle = 'Error Inesperado';
  } else if (typeof error === 'string') {
    errorMessage = error;
    errorTitle = 'Error';
  } else {
    errorMessage = 'Ha ocurrido un error desconocido';
    errorTitle = 'Error';
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900">{errorTitle}</h1>
        <p className="text-lg text-gray-600">{errorMessage}</p>
        <div className="mt-4">
          <Link
            to="/"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}