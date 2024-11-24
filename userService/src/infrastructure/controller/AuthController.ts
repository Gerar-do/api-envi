import { Request, Response } from 'express';
import { LoginUseCase } from '../../application/auth/Login-UseCase';
import { UserRepository } from '../repositories/UserRepository';

const userRepository = new UserRepository();

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { Correo, contraseña } = req.body;  // Cambié "email" y "password" a "Correo" y "contraseña"

    // Validación de campos
    if (!Correo || !contraseña) {
      res.status(400).json({
        success: false,
        message: 'Correo y contraseña son requeridos',
        data: null
      });
      return;
    }

    // Instanciar y ejecutar el caso de uso
    const loginUseCase = new LoginUseCase(userRepository);
    const result = await loginUseCase.execute({ Correo, contraseña }); // Cambié los nombres aquí también

    if (!result) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        data: null
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: result
    });
  } catch (error) {
    console.error('Error en login controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el inicio de sesión',
      data: null
    });
  }
};

export const logout = (_req: Request, res: Response): void => {
  try {
    // Eliminar la cookie usando múltiples métodos para mayor compatibilidad
    res.cookie('token', '', {
      expires: new Date(0),
      maxAge: 0,
      httpOnly: true,
    });

    // También limpiar usando clearCookie
    res.clearCookie('token', {
      httpOnly: true,
    });

    // Responder al cliente
    res.status(200).json({
      success: true,
      message: 'Has cerrado sesión con éxito',
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error en logout controller:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cerrar la sesión',

    });
  }
};

