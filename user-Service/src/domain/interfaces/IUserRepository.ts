import { User } from '../models/User';

export interface IUserRepository {
  createUser(user: Omit<User, 'id'>): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  getUserByUUID(uuid: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByPhone(telefono: string): Promise<User | null>; // Nuevo método
  updateUser(id: number, userData: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(): Promise<User[]>;
}