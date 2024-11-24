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

  async getUserByUUID(uuid: string): Promise<User | null> {
    const user = await this.db('users').where({ uuid }).first();
    return user || null; // Implementación simple
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
  
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('Consultando base de datos para email:', email);
      const user = await this.db('users')
        .where({ Correo: email })
        .first();
      
      console.log('Resultado de la consulta:', user ? 'Usuario encontrado' : 'Usuario no encontrado');
      return user || null;
    } catch (error) {
      console.error('Error en UserRepository.getUserByEmail:', error);
      throw error;
    }
  }
}
