// src/app.ts
import express from 'express';
import cors from 'cors';
import { config } from './infrastructure/config/config';
import { connectDB } from './infrastructure/config/MongoDB';
import setupPublicationRoutes from './infrastructure/adapters/routes/PublicationRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configurar rutas
app.use('/', setupPublicationRoutes());

// Conectar a la base de datos y arrancar el servidor
connectDB().then(() => {
    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
});

export default app;