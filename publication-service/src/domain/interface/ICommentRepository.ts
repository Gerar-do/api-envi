import { IComment } from '../models/Comments';

// domain/interface/ICommentRepository.ts
export interface ICommentRepository {
    createComment(comment: IComment): Promise<IComment>;
    getCommentsByPublicationId(publicationId: string, page?: number, limit?: number): Promise<IComment[]>;
    getCommentById(id: number): Promise<IComment | null>;
    deleteComment(id: number): Promise<boolean>;
    updateComment(id: number, content: string, sentiment?: number, toxicityScore?: number): Promise<IComment | null>;
    countCommentsByPublication(publicationId: string): Promise<number>;
    getUserComments(userId: string, page?: number, limit?: number): Promise<IComment[]>;
    getCommentsByDateRange(startDate: Date, endDate: Date, page?: number, limit?: number): Promise<IComment[]>;
    getCommentsBySentimentRange(minSentiment: number, maxSentiment: number, page?: number, limit?: number): Promise<IComment[]>;
  }