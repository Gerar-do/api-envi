import { IPublicationRepository } from '../../../domain/interface/IPublicationRepository';
import { IPublication } from '../../../domain/models/Publication';


export class UpdatePublicationUseCase {
  constructor(private readonly publicationRepository: IPublicationRepository) {}

  async execute(id: string, publication: Partial<IPublication>): Promise<IPublication | null> {
    return await this.publicationRepository.updatePublication(id, publication);
  }
}