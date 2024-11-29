// src/components/Layout/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    VideoCameraIcon,
    BellIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    BuildingOfficeIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

interface NavItemProps {
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    end?: boolean;
    collapsed?: boolean;
    onCloseMobile?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, end, collapsed, onCloseMobile }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout>();

    const handleMouseEnter = () => {
        if (collapsed) {
            const timer = setTimeout(() => {
                setShowTooltip(true);
            }, 1500);
            setTooltipTimer(timer);
        }
    };

    const handleMouseLeave = () => {
        if (tooltipTimer) {
            clearTimeout(tooltipTimer);
        }
        setShowTooltip(false);
    };

    const handleClick = () => {
        if (onCloseMobile) {
            onCloseMobile();
        }
    };

    return (
        <div 
            className="relative" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
        >
            <NavLink
                to={to}
                end={end}
                onClick={handleClick}
                className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                }
            >
                <Icon className={`${collapsed ? 'mr-0' : 'mr-4'} h-6 w-6`} />
                {!collapsed && <span>{label}</span>}
            </NavLink>
            {showTooltip && collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50">
                    {label}
                </div>
            )}
        </div>
    );
};

interface SidebarProps {
    onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
    const [collapsed, setCollapsed] = useState(false);

    const navItems: Omit<NavItemProps, 'collapsed' | 'onCloseMobile'>[] = [
        { to: '/dashboard', icon: HomeIcon, label: 'Dashboard', end: true },
        { to: '/dashboard/cameras', icon: VideoCameraIcon, label: 'Cámaras' },
        { to: '/dashboard/events', icon: BellIcon, label: 'Eventos' },
        { to: '/dashboard/clients', icon: BuildingOfficeIcon, label: 'Clientes' },
        { to: '/dashboard/roles', icon: ShieldCheckIcon, label: 'Roles' },
        { to: '/dashboard/users', icon: UserGroupIcon, label: 'Usuarios' }
    ];

    return (
        <div className={`h-full bg-gray-800 ${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 transition-all duration-300`}>
            <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                    <div className="flex-shrink-0 flex items-center px-4">
                        <img
                            className="h-8 w-auto"
                            src="/logo.svg"
                            alt="Logo"
                        />
                        {!collapsed && (
                            <span className="ml-2 text-white font-medium text-lg">
                                Monitoreo
                            </span>
                        )}
                    </div>
                    <nav className="mt-5 flex-1 px-2 space-y-1">
                        {navItems.map((item) => (
                            <NavItem 
                                key={item.to} 
                                {...item} 
                                collapsed={collapsed}
                                onCloseMobile={onCloseMobile}
                            />
                        ))}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex-shrink-0 w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        {collapsed ? (
                            <ChevronDoubleRightIcon className="h-6 w-6" />
                        ) : (
                            <>
                                <ChevronDoubleLeftIcon className="h-6 w-6 mr-4" />
                                <span>Colapsar menú</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;