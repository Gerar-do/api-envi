import { IUserRepository } from '../domain/interfaces/IUserRepository';
import { LoginCredentials, AuthResponse } from '../domain/models/auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { getSignedImageUrl } from '../config/s3Config';

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthResponse | null> {
    try {
      console.log('Buscando usuario con Correo:', credentials.Correo);
      
      const user = await this.userRepository.getUserByEmail(credentials.Correo);

      if (!user) {
        console.log('Usuario no encontrado');
        return null;
      }

      console.log('Comparando contraseñas');
      const isValidPassword = await bcrypt.compare(
        credentials.contraseña,
        user.contraseña
      );

      if (!isValidPassword) {
        console.log('Contraseña inválida');
        return null;
      }

      let profilePicture = '';
      if (user.Foto_perfil) {
        profilePicture = await getSignedImageUrl(user.Foto_perfil);
      }

      console.log('Generando token');
      const token = jwt.sign(
        {
          id: user.id,
          uuid: user.uuid,
          email: user.Correo,
          Nombre: user.Nombre,
          profilePicture
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      console.log("Token generado:", token);

      const { contraseña, ...userWithoutPassword } = user;

      return {
        token,
        user: {
          ...userWithoutPassword,
          Foto_perfil: profilePicture
        }
      };
    } catch (error) {
      console.error('Error en LoginUseCase:', error);
      throw error;
    }
  }
}