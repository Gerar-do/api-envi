import { IPublicationRepository } from '../../../domain/interface/IPublicationRepository';

export class DeletePublicationUseCase {
  constructor(private readonly publicationRepository: IPublicationRepository) {}

  async execute(id: string): Promise<void> {
    await this.publicationRepository.deletePublication(id);
  }
}