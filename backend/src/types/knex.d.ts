import { Knex } from 'knex';

declare module 'knex/types/tables' {
  interface Tables {
    users: {
      id: number;
      username: string;
      password: string;
      role: string;
      permissions: string[];
      created_at: Date;
      updated_at: Date;
    };
    cameras: {
      id: number;
      name: string;
      stream_url: string;
      status: string;
      type: string;
      config: Record<string, any>;
      created_at: Date;
      updated_at: Date;
    };
    events: {
      id: number;
      type: string;
      description: string;
      camera_id: number | null;
      timestamp: Date;
    };
  }
} 