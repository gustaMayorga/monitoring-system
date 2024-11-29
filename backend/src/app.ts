import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { camerasRouter } from './routes/cameras';
import { eventsRouter } from './routes/events';
import { rolesRouter } from './routes/roles';
import { permissionsRouter } from './routes/permissions';
import { clientsRouter } from './routes/clients';
import config from './config';

const app = express();

// Configuración de CORS
app.use(cors(config.cors));

app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

// Rutas
app.use('/api/auth', authRouter);
app.use('/api/cameras', camerasRouter);
app.use('/api/events', eventsRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/clients', clientsRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
});

export { app }; 