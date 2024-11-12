import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Bell,
  Settings,
  Users,
  FileText,
  Package,
  Calendar,
  LogOut,
  Menu,
  Building2
} from 'lucide-react';
import NotificationPanel from '../Notifications/NotificationPanel';


import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
  } from '@/components/ui';
const sidebarItems = [
  {
    title: 'Monitoreo',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: Camera, label: 'Cámaras', path: '/cameras' },
      { icon: Bell, label: 'Alertas', path: '/alerts' },
    ]
  },
  {
    title: 'Gestión',
    items: [
      { icon: Users, label: 'Clientes', path: '/clients' },
      { icon: Building2, label: 'Empresas', path: '/companies' },
      { icon: Calendar, label: 'Agenda', path: '/schedule' },
      { icon: Package, label: 'Inventario', path: '/inventory' },
      { icon: FileText, label: 'Reportes', path: '/reports' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { icon: Settings, label: 'Configuración', path: '/settings' },
    ]
  }
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const userName = "Admin"; // Esto debería venir de tu estado de autenticación

  return (
    <div className="h-screen flex dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800 border-r w-64">
          <div className="flex items-center mb-6 p-2">
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Sistema de Monitoreo
            </h1>
          </div>
          
          <nav className="space-y-6">
            {sidebarItems.map((section) => (
              <div key={section.title}>
                <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {section.title}
                </h2>
                <div className="mt-2 space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                          isActive
                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'md:ml-64' : ''}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b px-4 py-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-4">
              <NotificationPanel />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative">
                    <span className="text-sm font-medium">{userName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4">
          <div className="container mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}