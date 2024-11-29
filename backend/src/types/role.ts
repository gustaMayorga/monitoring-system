export interface Role {
    id: number;
    name: string;
    description?: string;
    permissions: string[];
    created_at: Date;
    updated_at: Date;
}

export interface Permission {
    id: number;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface RoleWithPermissions extends Role {
    permissions: Permission[];
} 