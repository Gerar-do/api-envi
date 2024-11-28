import { IUserRepository } from '../domain/interfaces/IUserRepository';

export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<any[]> {
    const users = await this.userRepository.listUsers();
    return users;
  }
}
