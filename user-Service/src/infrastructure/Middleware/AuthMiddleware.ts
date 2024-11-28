// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

// Set para almacenar tokens invalidados (blacklist)
export const invalidatedTokens = new Set<string>();

// Extender la interfaz Request para incluir el usuario
export interface AuthRequest extends Request {
  user?: any; // Puedes definir una interfaz más específica para el usuario
}

export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        message: 'Token no proporcionado'
      });
      return;
    }

    // Verificar si el token está en la lista negra
    if (invalidatedTokens.has(token)) {
      res.status(401).json({
        message: 'Token inválido o expirado'
      });
      return;
    }

    // Verificar el token
    const decoded = jwt.verify(token, config.jwt.secret);
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Token inválido'
    });
    return;
  }
};