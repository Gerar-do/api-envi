import { IUserRepository } from '../../domain/IUserRepository';
import { User } from '../../domain/User';
import { Database } from '../../infrastructure/database/msql';

export class UserRepository implements IUserRepository {
  private db = Database.getInstance();

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const [id] = await this.db('users').insert(user);
    return { id, ...user };
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.db('users').where({ id }).first();
    return user || null;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    await this.db('users').where({ id }).update(userData);
    return this.getUserById(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const deletedRows = await this.db('users').where({ id }).delete();
    return deletedRows > 0;
  }

  async listUsers(): Promise<User[]> {
    return this.db('users').select();
  }
}
