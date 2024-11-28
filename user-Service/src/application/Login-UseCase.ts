import { IUserRepository } from '../domain/interfaces/IUserRepository';
import { LoginCredentials, AuthResponse } from '../domain/models/auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config';

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthResponse | null> {
    try {
      // Ajustamos los nombres de los campos de acuerdo con lo que esperas
      console.log('Buscando usuario con Correo:', credentials.Correo);
      
      const user = await this.userRepository.getUserByEmail(credentials.Correo);

      if (!user) {
        console.log('Usuario no encontrado');
        return null;
      }

      console.log('Comparando contraseñas');
      const isValidPassword = await bcrypt.compare(
        credentials.contraseña,  // Aseguramos que el campo se llama "contraseña"
        user.contraseña
      );

      if (!isValidPassword) {
        console.log('Contraseña inválida');
        return null;
      }

      console.log('Generando token');
      const token = jwt.sign(
        {
          id: user.id,
          uuid: user.uuid,
          email: user.Correo,  // Usamos "Correo" aquí también
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Imprimir el token en consola para que lo veas
      console.log("Token generado:", token);

      // Eliminamos la contraseña del objeto de usuario
      const { contraseña, ...userWithoutPassword } = user;

      // Devolvemos el token y los datos del usuario sin la contraseña
      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error('Error en LoginUseCase:', error);
      throw error;
    }
  }
}
