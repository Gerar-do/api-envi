import { IUserRepository } from '../domain/IUserRepository';

export class GetUserByUUIDUseCase {
constructor(private userRepository: IUserRepository) {}

async execute(uuid: string): Promise<any> {
    const user = await this.userRepository.getUserByUUID(uuid);
    return user;
}
}
