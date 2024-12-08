// src/infrastructure/repositories/CommentRepository.ts

import { pool } from '../config/PostgresDB';
import { IComment } from '../../domain/models/Comments';
import { ICommentRepository } from '../../domain/interface/ICommentRepository';

export class CommentRepository implements ICommentRepository {
  async createComment(comment: IComment): Promise<IComment> {
    const { rows } = await pool.query(
      `INSERT INTO comments (
        publication_id, 
        user_id, 
        user_name, 
        content, 
        sentiment, 
        toxicity_score
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id,
        publication_id as "publicationId",
        user_id as "userId",
        user_name as "userName",
        content,
        sentiment,
        toxicity_score as "toxicityScore",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [
        comment.publicationId,
        comment.userId,
        comment.userName,
        comment.content,
        comment.sentiment,
        comment.toxicityScore
      ]
    );
    return rows[0];
  }

  async getCommentsByPublicationId(
    publicationId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IComment[]> {
    const offset = (page - 1) * limit;
    
    const { rows } = await pool.query(
      `SELECT 
        id,
        publication_id as "publicationId",
        user_id as "userId",
        user_name as "userName",
        content,
        sentiment,
        toxicity_score as "toxicityScore",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM comments 
      WHERE publication_id = $1 
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
      [publicationId, limit, offset]
    );
    return rows;
  }

  async getCommentById(id: number): Promise<IComment | null> {
    const { rows } = await pool.query(
      `SELECT 
        id,
        publication_id as "publicationId",
        user_id as "userId",
        user_name as "userName",
        content,
        sentiment,
        toxicity_score as "toxicityScore",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM comments 
      WHERE id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM comments WHERE id = $1',
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async updateComment(
    id: number,
    content: string,
    sentiment?: number,
    toxicityScore?: number
  ): Promise<IComment | null> {
    const { rows } = await pool.query(
      `UPDATE comments 
      SET 
        content = $1,
        sentiment = COALESCE($2, sentiment),
        toxicity_score = COALESCE($3, toxicity_score),
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4 
      RETURNING 
        id,
        publication_id as "publicationId",
        user_id as "userId",
        user_name as "userName",
        content,
        sentiment,
        toxicity_score as "toxicityScore",
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [content, sentiment, toxicityScore, id]
    );
    return rows[0] || null;
  }

  async countCommentsByPublication(publicationId: string): Promise<number> {
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE publication_id = $1',
      [publicationId]
    );
    return parseInt(rows[0].count);
  }

  async getUserComments(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IComment[]> {
    const offset = (page - 1) * limit;
    
    const { rows } = await pool.query(
      `SELECT 
        id,
        publication_id as "publicationId",
        user_id as "userId",
        user_name as "userName",
        content,
        sentiment,
        toxicity_score as "toxicityScore",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM comments 
      WHERE user_id = $1 
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows;
  }

  async getCommentsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10
  ): Promise<IComment[]> {
    const offset = (page - 1) * limit;
    
    const { rows } = await pool.query(
      `SELECT 
        id,
        publication_id as "publicationId",
        user_id as "userId",
        user_name as "userName",
        content,
        sentiment,
        toxicity_score as "toxicityScore",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM comments 
      WHERE created_at BETWEEN $1 AND $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4`,
      [startDate, endDate, limit, offset]
    );
    return rows;
  }

  async getCommentsBySentimentRange(
    minSentiment: number,
    maxSentiment: number,
    page: number = 1,
    limit: number = 10
  ): Promise<IComment[]> {
    const offset = (page - 1) * limit;
    
    const { rows } = await pool.query(
      `SELECT 
        id,
        publication_id as "publicationId",
        user_id as "userId",
        user_name as "userName",
        content,
        sentiment,
        toxicity_score as "toxicityScore",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM comments 
      WHERE sentiment BETWEEN $1 AND $2
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4`,
      [minSentiment, maxSentiment, limit, offset]
    );
    return rows;
  }
}