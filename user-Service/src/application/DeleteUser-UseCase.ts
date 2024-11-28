import { IUserRepository } from '../domain/interfaces/IUserRepository';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: number): Promise<boolean> {
    return this.userRepository.deleteUser(id);
  }
}
