// src/domain/models/Comment.ts
export interface IComment {
    id?: number;
    publicationId: string;
    userId: string;
    userName: string;  // Agregado el campo userName
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
  }