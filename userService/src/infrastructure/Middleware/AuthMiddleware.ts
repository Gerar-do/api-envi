import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../config/config';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {  // Especificamos que retorna void
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ 
        success: false,
        message: 'No se proporcionó token de acceso' 
      });
      return;
    }

    jwt.verify(token, config.jwt.secret, (err: any, user: any) => {
      if (err) {
        res.status(403).json({ 
          success: false,
          message: 'Token inválido o expirado' 
        });
        return;
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en la autenticación' 
    });
  }
};