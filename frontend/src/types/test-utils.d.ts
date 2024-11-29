interface MockStorage {
  [key: string]: any;
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
  length: number;
  key: jest.Mock;
}

declare global {
  namespace NodeJS {
    interface Global {
      localStorage: MockStorage;
    }
  }

  interface Window {
    localStorage: MockStorage;
  }
} 