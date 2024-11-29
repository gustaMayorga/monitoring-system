import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import Clients from '../pages/Clients';
import Users from '../pages/Users';
import MainLayout from '../layouts/MainLayout';

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginPage />
    },
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                path: "",
                element: <Navigate to="/dashboard" replace />
            },
            {
                path: "dashboard",
                element: <Dashboard />
            },
            {
                path: "clients",
                element: <Clients />
            },
            {
                path: "users",
                element: <Users />
            }
        ]
    }
]); 