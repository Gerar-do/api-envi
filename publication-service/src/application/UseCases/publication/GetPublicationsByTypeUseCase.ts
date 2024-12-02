import { IPublicationRepository } from '../../../domain/interface/IPublicationRepository';
import { IPublication } from '../../../domain/models/Publication';
export class GetPublicationsByTypeUseCase {
  constructor(private readonly publicationRepository: IPublicationRepository) {}

  async execute(type: 'free' | 'paid'): Promise<IPublication[]> {
    return await this.publicationRepository.getPublicationsByType(type);
  }
}