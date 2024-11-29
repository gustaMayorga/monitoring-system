declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';
            DB_HOST: string;
            DB_PORT: string;
            DB_USER: string;
            DB_PASSWORD: string;
            DB_NAME: string;
            JWT_SECRET: string;
            PORT: string;
        }
    }
}

export {}; 