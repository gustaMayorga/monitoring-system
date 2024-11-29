import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const usePermission = (requiredPermission: string) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
        return false;
    }

    const hasPermission = user.permissions?.includes(requiredPermission) || 
                         user.permissions?.includes('admin:all');

    if (!hasPermission) {
        navigate('/unauthorized');
        return false;
    }

    return true;
}; 