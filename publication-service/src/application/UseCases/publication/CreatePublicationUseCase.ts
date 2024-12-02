import { IPublicationRepository } from '../../../domain/interface/IPublicationRepository';
import { IPublication } from '../../../domain/models/Publication';

export class CreatePublicationUseCase {
  constructor(private readonly publicationRepository: IPublicationRepository) {}

  async execute(publication: IPublication): Promise<IPublication> {
    return await this.publicationRepository.createPublication(publication);
  }
}