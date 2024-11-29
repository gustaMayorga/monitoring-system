declare module 'msw' {
  export type DefaultBodyType = any;
  export type PathParams = Record<string, string>;

  export interface RestRequest<
    TBody = DefaultBodyType,
    TParams extends PathParams = PathParams
  > {
    url: URL;
    method: string;
    body: TBody;
    params: TParams;
    headers: Headers;
  }

  export interface RestContext {
    status: (statusCode: number) => ResponseTransformer;
    json: (body: any) => ResponseTransformer;
    text: (body: string) => ResponseTransformer;
    xml: (body: string) => ResponseTransformer;
    delay: (ms: number) => ResponseTransformer;
  }

  export interface ResponseTransformer {
    (response: Response): Response | Promise<Response>;
  }

  export interface ResponseComposition {
    (transformers: ResponseTransformer[]): Promise<Response>;
  }

  export type RequestHandler = (
    req: RestRequest,
    res: ResponseComposition,
    ctx: RestContext
  ) => Promise<Response>;

  export const rest: {
    get: (path: string, handler: RequestHandler) => RequestHandler;
    post: (path: string, handler: RequestHandler) => RequestHandler;
    put: (path: string, handler: RequestHandler) => RequestHandler;
    delete: (path: string, handler: RequestHandler) => RequestHandler;
    patch: (path: string, handler: RequestHandler) => RequestHandler;
  };
}

declare module 'msw/node' {
  import { RequestHandler } from 'msw';
  
  export function setupServer(...handlers: RequestHandler[]): {
    listen(options?: { onUnhandledRequest?: 'error' | 'warn' | 'bypass' }): void;
    close(): void;
    resetHandlers(): void;
    use(...handlers: RequestHandler[]): void;
  };
} 