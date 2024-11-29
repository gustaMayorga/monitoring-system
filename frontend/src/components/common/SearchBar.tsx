import React from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
    onSearch: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
    onSearch, 
    placeholder = 'Buscar...', 
    className = '' 
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const debouncedSearch = useDebounce(onSearch, 300);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    return (
        <div className={`relative ${className}`}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg 
                    className="h-5 w-5 text-gray-400" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    aria-hidden="true"
                >
                    <path 
                        fillRule="evenodd" 
                        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" 
                        clipRule="evenodd" 
                    />
                </svg>
            </div>
            <input
                type="search"
                value={searchTerm}
                onChange={handleChange}
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder={placeholder}
            />
        </div>
    );
}; 