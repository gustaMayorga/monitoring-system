import crypto from 'crypto';

export class DigestAuth {
    constructor(
        public username: string,
        public password: string
    ) {}

    private async generateNonce(): Promise<string> {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    private async generateCnonce(): Promise<string> {
        const array = new Uint8Array(8);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    private async md5(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const buffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('MD5', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private parseAuthHeader(header: string): Record<string, string> {
        const parts = header.substring(7).split(',');
        const auth: Record<string, string> = {};
        
        for (const part of parts) {
            const [key, value] = part.trim().split('=');
            auth[key] = value.replace(/"/g, '');
        }
        
        return auth;
    }

    generateDigestResponse(method: string, uri: string, wwwAuthenticate: string): string {
        const auth = this.parseAuthHeader(wwwAuthenticate);
        const realm = auth.realm;
        const nonce = auth.nonce;
        const qop = auth.qop;
        const cnonce = this.generateCnonce();
        const nc = '00000001';

        const ha1 = this.md5(`${this.username}:${realm}:${this.password}`);
        const ha2 = this.md5(`${method}:${uri}`);
        
        let response;
        if (qop) {
            response = this.md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`);
        } else {
            response = this.md5(`${ha1}:${nonce}:${ha2}`);
        }

        const parts = [
            `username="${this.username}"`,
            `realm="${realm}"`,
            `nonce="${nonce}"`,
            `uri="${uri}"`,
            `response="${response}"`
        ];

        if (qop) {
            parts.push(`qop=${qop}`);
            parts.push(`nc=${nc}`);
            parts.push(`cnonce="${cnonce}"`);
        }

        return `Digest ${parts.join(', ')}`;
    }
} 