import { IComment } from '../models/Comments';

export interface ICommentRepository {
 createComment(comment: IComment): Promise<IComment>;
 getCommentsByPublicationId(publicationId: string): Promise<IComment[]>;
 getCommentById(id: number): Promise<IComment | null>;
 deleteComment(id: number): Promise<boolean>;
 updateComment(id: number, content: string): Promise<IComment | null>;
 countCommentsByPublication(publicationId: string): Promise<number>;
}