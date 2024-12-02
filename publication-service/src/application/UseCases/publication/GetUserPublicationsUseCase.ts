import { IPublicationRepository } from '../../../domain/interface/IPublicationRepository';
import { IPublication } from '../../../domain/models/Publication';
export class GetUserPublicationsUseCase {
  constructor(private readonly publicationRepository: IPublicationRepository) {}

  async execute(userId: string): Promise<IPublication[]> {
    return await this.publicationRepository.getUserPublications(userId);
  }
}