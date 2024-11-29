import { setupServer } from 'msw/node';
import { handlers } from './handlers.minimal';

export const server = setupServer(...handlers);