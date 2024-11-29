export class Logger {
    constructor(private context: string) {}

    info(message: string, ...args: any[]): void {
        console.log(`[${this.timestamp}] [${this.context}] [INFO] ${message}`, ...args);
    }

    warn(message: string, ...args: any[]): void {
        console.warn(`[${this.timestamp}] [${this.context}] [WARN] ${message}`, ...args);
    }

    error(message: string, ...args: any[]): void {
        console.error(`[${this.timestamp}] [${this.context}] [ERROR] ${message}`, ...args);
    }

    debug(message: string, ...args: any[]): void {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[${this.timestamp}] [${this.context}] [DEBUG] ${message}`, ...args);
        }
    }

    private get timestamp(): string {
        return new Date().toISOString();
    }
} 