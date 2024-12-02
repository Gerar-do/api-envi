// AuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

// Interfaz para el payload del token
interface UserPayload {
    id: number;
    uuid: string;
    email: string;
    profilePicture: string;
    iat: number;
    exp: number;
}

// Extender Request para incluir el usuario tipado
interface AuthRequest extends Request {
    user?: UserPayload;
}

// Asegurarnos de que tenemos un JWT_SECRET
const JWT_SECRET = config.jwtSecret || 'tu_jwt_secret_por_defecto';

export const validateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Token recibido:', token);

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        console.log('Token decodificado:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Error al verificar token:', err);
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};