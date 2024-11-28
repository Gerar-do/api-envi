import { IUserRepository } from '../domain/interfaces/IUserRepository';
import { User } from '../domain/models/User';

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userData: Omit<User, 'id'>): Promise<User> {
    const user = await this.userRepository.createUser(userData);
    return user;
  }
}
