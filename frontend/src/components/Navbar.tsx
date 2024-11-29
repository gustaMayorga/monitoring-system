import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, BellIcon, UserIcon } from '@heroicons/react/solid';
import { Menu } from '@headlessui/react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <img
                                className="h-8 w-auto"
                                src="/logo.svg"
                                alt="Logo"
                            />
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                        >
                            {theme === 'dark' ? (
                                <SunIcon className="h-6 w-6" />
                            ) : (
                                <MoonIcon className="h-6 w-6" />
                            )}
                        </button>
                        <button className="p-2 rounded-md text-gray-400 hover:text-gray-500">
                            <BellIcon className="h-6 w-6" />
                        </button>
                        <Menu as="div" className="ml-3 relative">
                            <Menu.Button className="flex items-center">
                                <UserIcon className="h-8 w-8 rounded-full" />
                            </Menu.Button>
                            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={logout}
                                            className={`${
                                                active ? 'bg-gray-100' : ''
                                            } block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                                        >
                                            Cerrar Sesión
                                        </button>
                                    )}
                                </Menu.Item>
                            </Menu.Items>
                        </Menu>
                    </div>
                </div>
            </div>
        </nav>
    );
} 