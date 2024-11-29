import { NavLink } from 'react-router-dom';
import {
    HomeIcon,
    VideoCameraIcon,
    ShieldExclamationIcon,
    UserGroupIcon,
    ClipboardListIcon
} from '@heroicons/react/outline';

const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Monitoreo', href: '/monitoring', icon: VideoCameraIcon },
    { name: 'Alarmas', href: '/alarms', icon: ShieldExclamationIcon },
    { name: 'Clientes', href: '/clients', icon: UserGroupIcon },
    { name: 'Servicios', href: '/services', icon: ClipboardListIcon }
];

export default function Sidebar() {
    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                    <div className="flex-1 px-2 space-y-1">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                                        isActive
                                            ? 'bg-gray-100 text-gray-900'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`
                                }
                            >
                                <item.icon
                                    className="mr-3 flex-shrink-0 h-6 w-6"
                                    aria-hidden="true"
                                />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 