import { IPublication } from '../models/Publication';

export interface IPublicationRepository {
  createPublication(publication: IPublication): Promise<IPublication>;
  getPublicationById(id: string): Promise<IPublication | null>;
  getUserPublications(userId: string): Promise<IPublication[]>;
  updatePublication(id: string, publication: Partial<IPublication>): Promise<IPublication | null>;
  deletePublication(id: string): Promise<void>;
  getAllPublications(): Promise<IPublication[]>;
  getPublicationsByType(type: 'free' | 'paid'): Promise<IPublication[]>;
}