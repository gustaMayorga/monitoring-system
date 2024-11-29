import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { User } from '../types/user';

interface JwtPayload {
    userId: number;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                role: string;
                role_id: number;
                permissions: string[];
            };
        }
    }
}

const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

        const user = await userRepository.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const permissions = await roleRepository.getPermissions(user.role_id);

        req.user = {
            id: user.id,
            role: user.role,
            role_id: user.role_id,
            permissions
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        next(error);
    }
};

export const checkPermission = (requiredPermission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Administradores tienen todos los permisos
        if (req.user.role === 'admin') {
            return next();
        }

        if (!req.user.permissions.includes(requiredPermission)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
    };
};

export const checkRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient role' });
        }

        next();
    };
};