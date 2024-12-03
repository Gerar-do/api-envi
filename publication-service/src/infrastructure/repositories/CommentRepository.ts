import { pool } from '../config/PostgresDB';
import { IComment } from '../../domain/models/Comments';
import { ICommentRepository } from '../../domain/interface/ICommentRepository';

export class CommentRepository implements ICommentRepository {
 async createComment(comment: IComment): Promise<IComment> {
   const { rows } = await pool.query(
     `INSERT INTO comments (publication_id, user_id, user_name, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
     [comment.publicationId, comment.userId, comment.userName, comment.content]
   );
   return rows[0];
 }

 async getCommentsByPublicationId(publicationId: string): Promise<IComment[]> {
   const { rows } = await pool.query(
     `SELECT * FROM comments 
      WHERE publication_id = $1 
      ORDER BY created_at DESC`,
     [publicationId]
   );
   return rows;
 }

 async getCommentById(id: number): Promise<IComment | null> {
   const { rows } = await pool.query(
     `SELECT * FROM comments WHERE id = $1`,
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

 async updateComment(id: number, content: string): Promise<IComment | null> {
   const { rows } = await pool.query(
     `UPDATE comments 
      SET content = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *`,
     [content, id]
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
}