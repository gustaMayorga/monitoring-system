export interface User {
    id: number;
    username: string;
    password: string;
    role: string;
    role_id: number;
    permissions: string[];
    created_at: Date;
    updated_at: Date;
}

export interface UserCredentials {
    username: string;
    password: string;
}

export interface DbUser {
    id?: number;
    username: string;
    password: string;
    role: string;
    role_id: number;
    permissions: string[];
    created_at: Date;
    updated_at: Date;
} 