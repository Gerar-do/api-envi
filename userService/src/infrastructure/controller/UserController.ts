import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { CreateUserUseCase } from '../../application/CreateUser-UseCase';
import { GetUserUseCase } from '../../application/GetUser-UseCase';
import { UpdateUserUseCase } from '../../application/UpdateUser-UseCase';
import { DeleteUserUseCase } from '../../application/DeleteUser-UseCase';
import { ListUsersUseCase } from '../../application/ListUser-UseCase';

const userRepository = new UserRepository();

export const createUser = async (req: Request, res: Response) => {
  const useCase = new CreateUserUseCase(userRepository);
  const user = await useCase.execute(req.body);
  res.status(201).json(user);
};

export const getUser = async (req: Request, res: Response) => {
  const useCase = new GetUserUseCase(userRepository);
  const user = await useCase.execute(Number(req.params.id));
  res.json(user);
};

export const updateUser = async (req: Request, res: Response) => {
  const useCase = new UpdateUserUseCase(userRepository);
  const user = await useCase.execute(Number(req.params.id), req.body);
  res.json(user);
};

export const deleteUser = async (req: Request, res: Response) => {
  const useCase = new DeleteUserUseCase(userRepository);
  const success = await useCase.execute(Number(req.params.id));
  res.json({ success });
};

export const listUsers = async (_req: Request, res: Response) => {
  const useCase = new ListUsersUseCase(userRepository);
  const users = await useCase.execute();
  res.json(users);
};
