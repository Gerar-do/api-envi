import { IPublicationRepository } from '../../../domain/interface/IPublicationRepository';
import { IPublication } from '../../../domain/models/Publication';
export class GetAllPublicationsUseCase {
  constructor(private readonly publicationRepository: IPublicationRepository) {}

  async execute(): Promise<IPublication[]> {
    return await this.publicationRepository.getAllPublications();
  }
}