import React from 'react';

interface PageContainerProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export default function PageContainer({ title, subtitle, children }: PageContainerProps) {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                        {subtitle && (
                            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
} 