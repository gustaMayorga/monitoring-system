export interface Role {
    id: number;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
    permissions?: string[];
}

export interface CreateRoleDTO {
    name: string;
    description?: string;
}

export interface UpdateRoleDTO extends Partial<CreateRoleDTO> {} 