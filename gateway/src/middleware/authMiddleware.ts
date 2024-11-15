import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { eventPublisher } from '../events/eventPublisher';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).send({ error: 'Access denied. No token provided.' });
        return;  // Asegúrate de finalizar la ejecución aquí
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        (req as any).user = decoded;  // Usar 'as any' para evitar errores de tipo temporalmente

        // Emitir un evento de autenticación exitosa
        eventPublisher.emit('authSuccess', { user: decoded });

        next();  // Continúa con el siguiente middleware o ruta
    } catch (ex) {
        res.status(400).send({ error: 'Invalid token.' });
    }
};
