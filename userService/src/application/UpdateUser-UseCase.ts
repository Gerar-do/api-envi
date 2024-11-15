import { IUserRepository } from '../domain/IUserRepository';
import { User } from '../domain/User';

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: number, userData: Partial<User>): Promise<User | null> {
    const user = await this.userRepository.updateUser(id, userData);
    return user;
  }
}
