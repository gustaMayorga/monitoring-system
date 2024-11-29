import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange
}) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <nav className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Mostrando página <span className="font-medium">{currentPage}</span> de{' '}
                        <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <ul className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <li>
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                    currentPage === 1 ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                                <span className="sr-only">Anterior</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </li>
                        {pages.map((page) => (
                            <li key={page}>
                                <button
                                    onClick={() => onPageChange(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                        currentPage === page
                                            ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                    }`}
                                >
                                    {page}
                                </button>
                            </li>
                        ))}
                        <li>
                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                    currentPage === totalPages ? 'cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                                <span className="sr-only">Siguiente</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}; 