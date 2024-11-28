import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../repositories/UserRepository';
import { CreateUserUseCase } from '../../../application/CreateUser-UseCase';
import { GetUserUseCase } from '../../../application/GetUser-UseCase';
import { UpdateUserUseCase } from '../../../application/UpdateUser-UseCase';
import { DeleteUserUseCase } from '../../../application/DeleteUser-UseCase';
import { ListUsersUseCase } from '../../../application/ListUser-UseCase';
import { GetUserByUUIDUseCase } from '../../../application/GetUserByUUID-UseCase';
import upload from '../../Middleware/multerS3Middleware';
import config from '../../../config/config'; 
import { getSignedImageUrl } from '../../../config/s3Config';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const userRepository = new UserRepository();

export const uploadProfilePicture = upload.single('profile-picture');

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.params.id);
    const updateData = req.body;

    if (req.file) {
      updateData.Foto_perfil = (req.file as any).key;
    }

    const useCase = new UpdateUserUseCase(userRepository);
    const user = await useCase.execute(userId, updateData);

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (user.Foto_perfil) {
      user.Foto_perfil = await getSignedImageUrl(user.Foto_perfil);
    }

    res.json({ 
      message: "Has editado este usuario", 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: "Error al editar el usuario" });
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, nombre, apellido } = req.body;

    if (!email || !password || !nombre || !apellido) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
      });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let profilePictureKey = '';
    if (req.file) {
      profilePictureKey = (req.file as any).key;
    }

    const userWithUUID = {
      Correo: email,
      contraseña: hashedPassword,
      Nombre: nombre,
      Apellido: apellido,
      uuid: uuidv4(),
      isActive: true,
      Foto_perfil: profilePictureKey
    };

    const useCase = new CreateUserUseCase(userRepository);
    const user = await useCase.execute(userWithUUID);

    if (!user) {
      res.status(500).json({ 
        success: false,
        message: 'Error al crear el usuario' 
      });
      return;
    }

    if (user.Foto_perfil) {
      user.Foto_perfil = await getSignedImageUrl(user.Foto_perfil);
    }

    res.status(201).json({
      success: true,
      message: 'Usuario creado con éxito',
      user,
    });
  } catch (error) {
    let errorMessage = 'Error al crear el usuario';
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      errorMessage = 'Ya existe un usuario con los mismos datos';
    }
    res.status(500).json({ message: errorMessage });
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const useCase = new GetUserUseCase(userRepository);
    const user = await useCase.execute(Number(req.params.id));

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (user.Foto_perfil) {
      user.Foto_perfil = await getSignedImageUrl(user.Foto_perfil);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const useCase = new DeleteUserUseCase(userRepository);
    const success = await useCase.execute(Number(req.params.id));
    if (success) {
      res.json({ message: "Has eliminado a este usuario" });
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const useCase = new ListUsersUseCase(userRepository);
    const users = await useCase.execute();

    if (!users) {
      res.status(500).json({ message: "Error al obtener la lista de usuarios" });
      return;
    }

    const usersWithSignedUrls = await Promise.all(
      users.map(async (user) => {
        if (user.Foto_perfil) {
          user.Foto_perfil = await getSignedImageUrl(user.Foto_perfil);
        }
        return user;
      })
    );

    res.json(usersWithSignedUrls);
  } catch (error) {
    res.status(500).json({ message: "Error al listar usuarios" });
  }
};

export const getUserByUUID = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const useCase = new GetUserByUUIDUseCase(userRepository);
    const user = await useCase.execute(req.params.uuid);

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    if (user.Foto_perfil) {
      user.Foto_perfil = await getSignedImageUrl(user.Foto_perfil);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario por UUID" });
  }
};