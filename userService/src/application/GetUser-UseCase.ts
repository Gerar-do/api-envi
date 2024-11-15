import { IUserRepository } from '../domain/IUserRepository';

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: number): Promise<any> {
    const user = await this.userRepository.getUserById(id);
    return user;
  }
}
