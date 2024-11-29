export interface ServerConfig {
    port: number | string;
    host: string;
    ws: {
        path: string;
        heartbeat: number;
    };
}

export interface DatabaseConfig {
    client: string;
    connection: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
    pool: {
        min: number;
        max: number;
    };
    migrations: {
        tableName: string;
        directory: string;
    };
    seeds: {
        directory: string;
    };
}

export interface JwtConfig {
    secret: string;
    expiresIn: string;
}

export interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    from: string;
}

export interface CorsConfig {
    origin: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
}

export interface AppConfig {
    server: ServerConfig;
    database: DatabaseConfig;
    jwt: JwtConfig;
    email: EmailConfig;
    cors: CorsConfig;
} 