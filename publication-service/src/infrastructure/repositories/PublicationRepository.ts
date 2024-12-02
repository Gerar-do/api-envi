import { IPublication, Publication } from '../../domain/models/Publication';
import { IPublicationRepository } from '../../domain/interface/IPublicationRepository';

export class PublicationRepository implements IPublicationRepository {
  async createPublication(publication: IPublication): Promise<IPublication> {
    const newPublication = new Publication(publication);
    return await newPublication.save();
  }

  async getPublicationById(id: string): Promise<IPublication | null> {
    return await Publication.findById(id);
  }

  async getUserPublications(userId: string): Promise<IPublication[]> {
    return await Publication.find({ userId });
  }

  async updatePublication(id: string, publication: Partial<IPublication>): Promise<IPublication | null> {
    return await Publication.findByIdAndUpdate(id, publication, { new: true });
  }

  async deletePublication(id: string): Promise<void> {
    await Publication.findByIdAndDelete(id);
  }

  async getAllPublications(): Promise<IPublication[]> {
    return await Publication.find();
  }

  async getPublicationsByType(type: 'free' | 'paid'): Promise<IPublication[]> {
    return await Publication.find({ type });
  }
}