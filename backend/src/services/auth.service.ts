import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import config from '../config';
import { LoginCredentials, User } from '../types/auth';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export class AuthService {
    constructor(private userRepository: UserRepository) {}

    async validateCredentials(credentials: LoginCredentials): Promise<User | null> {
        const user = await this.userRepository.findByUsername(credentials.username);
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        return isValid ? user : null;
    }

    async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
        const user = await this.validateCredentials(credentials);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const roleRepository = new RoleRepository();
        const permissions = await roleRepository.getPermissions(user.role_id);

        const token = jwt.sign(
            { 
                userId: user.id,
                role: user.role,
                permissions 
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        return {
            token,
            user: {
                ...user,
                permissions
            }
        };
    }
} 