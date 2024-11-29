// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    permissions?: string[];
}

export default function ProtectedRoute({ children, permissions = [] }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (permissions.length > 0 && !permissions.some(p => user?.permissions.includes(p))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}