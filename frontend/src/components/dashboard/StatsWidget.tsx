import React from 'react';
import {
    VideoCameraIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Stat {
    name: string;
    value: number;
    change?: number;
    changeType?: 'increase' | 'decrease';
}

interface StatsWidgetProps {
    stats: {
        cameras: Stat;
        alerts: Stat;
        clients: Stat;
        uptime: Stat;
    };
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({ stats }) => {
    const getIcon = (statName: string) => {
        switch (statName) {
            case 'cameras':
                return <VideoCameraIcon className="h-6 w-6 text-gray-400" />;
            case 'alerts':
                return <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />;
            case 'clients':
                return <UserGroupIcon className="h-6 w-6 text-gray-400" />;
            case 'uptime':
                return <CheckCircleIcon className="h-6 w-6 text-gray-400" />;
            default:
                return null;
        }
    };

    const getChangeColor = (change: number, type: 'increase' | 'decrease') => {
        if (type === 'increase') {
            return change > 0 ? 'text-green-600' : 'text-red-600';
        }
        return change > 0 ? 'text-red-600' : 'text-green-600';
    };

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(stats).map(([key, stat]) => (
                <div key={key} className="bg-white overflow-hidden rounded-lg shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {getIcon(key)}
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        {stat.name}
                                    </dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900">
                                            {stat.value}
                                        </div>
                                        {stat.change !== undefined && (
                                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                                                getChangeColor(stat.change, stat.changeType || 'increase')
                                            }`}>
                                                {stat.change > 0 ? '+' : ''}
                                                {stat.change}%
                                            </div>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}; 