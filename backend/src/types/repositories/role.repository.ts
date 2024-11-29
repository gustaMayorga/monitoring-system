import { Role } from '../role';

export interface CreateRoleDTO {
    name: string;
    description?: string;
    permissions: string[];
}

export interface UpdateRoleDTO {
    name?: string;
    description?: string;
    permissions?: string[];
}

export interface RoleRepositoryOptions {
    search?: string;
    limit?: number;
    offset?: number;
} 