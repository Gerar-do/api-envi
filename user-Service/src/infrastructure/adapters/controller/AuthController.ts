import { Request, Response } from 'express';
import { LoginUseCase } from '../../../application/Login-UseCase';
import { UserRepository } from '../../repositories/UserRepository';
import { invalidatedTokens } from '../../Middleware/AuthMiddleware';
import jwt from 'jsonwebtoken';

const userRepository = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-seguro';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Correo, contraseña } = req.body;

    if (!Correo || !contraseña) {
      res.status(400).json({
        message: 'Correo y contraseña son requeridos'
      });
      return;
    }

    const loginUseCase = new LoginUseCase(userRepository);
    const result = await loginUseCase.execute({ Correo, contraseña });

    if (!result) {
      res.status(401).json({
        message: 'Credenciales inválidas'
      });
      return;
    }

    console.log({
      token: result.token,
      message: 'Login exitoso'
    });

    res.status(200).json({
      message: 'Login exitoso',
      token: result.token
    });
  } catch (error) {
    console.error('Error en login controller:', error);
    res.status(500).json({
      message: 'Error en el inicio de sesión'
    });
  }
};

export const logout = (req: Request, res: Response): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      invalidatedTokens.add(token);
    }

    res.status(200).json({
      message: 'Logout exitoso'
    });
  } catch (error) {
    console.error('Error en logout controller:', error);
    res.status(500).json({
      message: 'Error en el cierre de sesión'
    });
  }
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        message: 'Token no proporcionado'
      });
      return;
    }

    // Verificar si el token está en la lista de tokens invalidados
    if (invalidatedTokens.has(token)) {
      res.status(401).json({
        message: 'Token invalidado'
      });
      return;
    }

    try {
      // Verificar la validez del token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Si el token es válido, retornamos la información del usuario
      res.status(200).json({
        valid: true,
        user: decoded
      });
    } catch (err) {
      res.status(401).json({
        message: 'Token inválido'
      });
    }
  } catch (error) {
    console.error('Error en verifyToken controller:', error);
    res.status(500).json({
      message: 'Error al verificar el token'
    });
  }
};

// Opcional: Método para limpiar tokens invalidados antiguos
export const cleanupInvalidatedTokens = (): void => {
  const now = Date.now();
  invalidatedTokens.forEach(token => {
    try {
      const decoded = jwt.decode(token) as { exp: number };
      if (decoded.exp * 1000 < now) {
        invalidatedTokens.delete(token);
      }
    } catch (error) {
      // Si no se puede decodificar, eliminamos el token
      invalidatedTokens.delete(token);
    }
  });
};

// Ejecutar limpieza periódicamente (cada hora)
setInterval(cleanupInvalidatedTokens, 3600000);