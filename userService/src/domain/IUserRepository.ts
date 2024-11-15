import { User } from '../domain/User';

export interface IUserRepository {
  createUser(user: Omit<User, 'id'>): Promise<User>;
  getUserById(id: number): Promise<User | null>;
  updateUser(id: number, userData: Partial<User>): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
  listUsers(): Promise<User[]>;
}
