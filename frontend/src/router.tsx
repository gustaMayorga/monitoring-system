import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Users from './pages/Users';
import Clients from './pages/Clients';
import AlarmPanels from './pages/AlarmPanels';
import PanelZones from './pages/PanelZones';
import Monitoring from './pages/Monitoring';
import TestPanel from './pages/TestPanel';
import ErrorPage from './pages/ErrorPage';

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />,
        errorElement: <ErrorPage />
    },
    {
        path: "/",
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "",
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: "users",
                element: (
                    <ProtectedRoute permissions={['users:read']}>
                        <Users />
                    </ProtectedRoute>
                )
            },
            {
                path: "clients",
                element: (
                    <ProtectedRoute permissions={['clients:read']}>
                        <Clients />
                    </ProtectedRoute>
                )
            },
            {
                path: "alarm-panels",
                element: (
                    <ProtectedRoute permissions={['alarms:read']}>
                        <AlarmPanels />
                    </ProtectedRoute>
                )
            },
            {
                path: "alarm-panels/:panelId/zones",
                element: (
                    <ProtectedRoute permissions={['alarms:read']}>
                        <PanelZones />
                    </ProtectedRoute>
                )
            },
            {
                path: "monitoring",
                element: (
                    <ProtectedRoute permissions={['alarms:read']}>
                        <Monitoring />
                    </ProtectedRoute>
                )
            },
            {
                path: "test-panel",
                element: (
                    <ProtectedRoute permissions={['alarms:write']}>
                        <TestPanel />
                    </ProtectedRoute>
                )
            }
        ]
    }
]); 