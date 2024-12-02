import { IPublicationRepository } from '../../../domain/interface/IPublicationRepository';
import { IPublication } from '../../../domain/models/Publication';
export class GetPublicationByIdUseCase {
  constructor(private readonly publicationRepository: IPublicationRepository) {}

  async execute(id: string): Promise<IPublication | null> {
    return await this.publicationRepository.getPublicationById(id);
  }
}