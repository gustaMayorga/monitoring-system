// Hacer que este archivo sea un módulo
export {};

// Extender expect
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}

// Configuración global para todas las pruebas
beforeAll(() => {
  // Configuración global antes de todas las pruebas
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Limpieza global después de todas las pruebas
}); 