import React from 'react';

export interface FilterOption {
    id: string;
    label: string;
    options: {
        value: string;
        label: string;
    }[];
}

interface FilterBarProps {
    filters: FilterOption[];
    selectedFilters: Record<string, string>;
    onFilterChange: (filterId: string, value: string) => void;
    className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    selectedFilters,
    onFilterChange,
    className = ''
}) => {
    return (
        <div className={`flex flex-wrap gap-4 ${className}`}>
            {filters.map((filter) => (
                <div key={filter.id} className="flex-1 min-w-[200px]">
                    <label htmlFor={filter.id} className="block text-sm font-medium text-gray-700">
                        {filter.label}
                    </label>
                    <select
                        id={filter.id}
                        value={selectedFilters[filter.id] || ''}
                        onChange={(e) => onFilterChange(filter.id, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">Todos</option>
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
    );
}; 