import express, { Application } from 'express';
import proxy from 'express-http-proxy';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { Signale } from "signale";
import { errorMiddleware } from './middleware/errorMiddleware';
import { eventPublisher } from './events/eventPublisher';

const app: Application = express();
const signale = new Signale();

app.use(morgan('dev'));
app.use(cors());
dotenv.config();

const PORT = process.env.PORT || 3000;

app.use('/api/v1/auth', proxy('http://localhost:3001'));
app.use('/api/v1/user', proxy('http://localhost:3002'));
app.use('/api/v1/institution', proxy('http://localhost:3003'));
app.use('/api/v1/analytics', proxy('http://localhost:3004'));
app.use('/api/v1/publication', proxy('http://localhost:3005'));

app.use(errorMiddleware); //middleware de manejo de errores 

// Escuchar el evento de autenticación exitosa
eventPublisher.on('authSuccess', (data) => {
    console.log('Autenticación exitosa para el usuario:', data.user);
});

app.listen(PORT, () => {
    signale.success(`Servidor corriendo en http://localhost:${PORT}`);
});
