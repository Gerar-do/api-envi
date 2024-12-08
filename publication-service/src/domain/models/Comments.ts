// src/domain/models/Comment.ts
export interface IComment {
  id?: number;
  publicationId: string;
  userId: string;
  userName: string;
  content: string;
  sentiment?: number;
  toxicityScore?: number;
  createdAt?: Date;
  updatedAt?: Date;
}