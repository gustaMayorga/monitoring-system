// frontend/src/types/api.ts
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }
  
  export interface ErrorResponse {
    message: string;
    code?: string;
    details?: unknown;
  }