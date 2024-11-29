import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    type: 'success' | 'warning' | 'danger' | 'info';
}

export function StatCard({ title, value, icon, type }: StatCardProps) {
    const getTypeClasses = () => {
        switch (type) {
            case 'success': return 'bg-green-50 text-green-600';
            case 'warning': return 'bg-yellow-50 text-yellow-600';
            case 'danger': return 'bg-red-50 text-red-600';
            case 'info': return 'bg-blue-50 text-blue-600';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className={`rounded-lg shadow p-6 ${getTypeClasses()}`}>
            <div className="flex justify-between items-center">
                <div className="flex-shrink-0">
                    {icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium truncate">
                            {title}
                        </dt>
                        <dd className="text-3xl font-semibold">
                            {value}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
} 