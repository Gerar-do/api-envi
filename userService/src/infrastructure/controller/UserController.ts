import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { CreateUserUseCase } from '../../application/CreateUser-UseCase';
import { GetUserUseCase } from '../../application/GetUser-UseCase';
import { UpdateUserUseCase } from '../../application/UpdateUser-UseCase';
import { DeleteUserUseCase } from '../../application/DeleteUser-UseCase';
import { ListUsersUseCase } from '../../application/ListUser-UseCase';
import { GetUserByUUIDUseCase } from '../../application/GetUserByUUID-UseCase';
import bcrypt from 'bcrypt';  // Importa bcrypt
import { v4 as uuidv4 } from 'uuid';

const userRepository = new UserRepository();

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, nombre, apellido } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!email || !password || !nombre || !apellido) {
      res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios',
      });
      return;
    }

    // Hashear la contraseña antes de guardar el usuario
    const saltRounds = 10;  // Establece el número de rondas de sal
    const hashedPassword = await bcrypt.hash(password, saltRounds);  // Hasheamos la contraseña

    // Generar un UUID único para el usuario
    const userWithUUID = {
      Correo: email,
      contraseña: hashedPassword,  // Establecemos la contraseña hasheada
      Nombre: nombre,
      Apellido: apellido,
      uuid: uuidv4(),  // Genera un UUID único
      isActive: true,
      Foto_perfil: '',  // Si es necesario establecer un valor por defecto
    };

    // Llamar al caso de uso para crear el usuario
    const useCase = new CreateUserUseCase(userRepository);
    const user = await useCase.execute(userWithUUID);

    // Enviar respuesta con éxito
    res.status(201).json({
      success: true,
      message: 'Usuario creado con éxito',
      user,
    });
  } catch (error) {
    let errorMessage = 'Error al crear el usuario';

    // Manejar errores de duplicados o internos
    if (error instanceof Error && error.message.includes('Duplicate entry')) {
      errorMessage = 'Ya existe un usuario con los mismos datos';
    }

    res.status(500).json({ message: errorMessage });
  }
};

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const useCase = new GetUserUseCase(userRepository);
    const user = await useCase.execute(Number(req.params.id));

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    const errorMessage = "Error al obtener el usuario";
    res.status(500).json({ message: errorMessage });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  try {
    const useCase = new UpdateUserUseCase(userRepository);
    const user = await useCase.execute(Number(req.params.id), req.body);
    res.json({ message: "Has editado este usuario", user });
  } catch (error) {
    const errorMessage = "Error al editar el usuario";
    res.status(500).json({ message: errorMessage });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const useCase = new DeleteUserUseCase(userRepository);
    const success = await useCase.execute(Number(req.params.id));
    if (success) {
      res.json({ message: "Has eliminado a este usuario" });
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    const errorMessage = "Error al eliminar el usuario";
    res.status(500).json({ message: errorMessage });
  }
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const useCase = new ListUsersUseCase(userRepository);
    const users = await useCase.execute();
    res.json(users);
  } catch (error) {
    const errorMessage = "Error al listar usuarios";
    res.status(500).json({ message: errorMessage });
  }
};

export const getUserByUUID = async (req: Request, res: Response): Promise<void> => {
  try {
    const useCase = new GetUserByUUIDUseCase(userRepository);
    const user = await useCase.execute(req.params.uuid);

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    const errorMessage = "Error al obtener el usuario por UUID";
    res.status(500).json({ message: errorMessage });
  }
};