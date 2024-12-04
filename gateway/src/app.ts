import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import cors from 'cors';
import { Signale } from "signale";
import { errorMiddleware } from './middleware/errorMiddleware';
import { eventPublisher } from './events/eventPublisher';
import { config } from './config/config';

const app: Application = express();
const signale = new Signale();

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo después de 15 minutos',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(morgan('dev'));
app.use(cors());
app.use(limiter);

// Proxy routes using environment variables
app.use('/api/v1/user', proxy(config.services.user));
app.use('/api/v1/analytics', proxy(config.services.analytics));
app.use('/api/v1/publication', proxy(config.services.publication));

app.use(errorMiddleware);

eventPublisher.on('authSuccess', (data) => {
    console.log('Autenticación exitosa para el usuario:', data.user);
});

app.listen(config.port, () => {
    signale.success(`Servidor corriendo en http://localhost:${config.port}`);
});

