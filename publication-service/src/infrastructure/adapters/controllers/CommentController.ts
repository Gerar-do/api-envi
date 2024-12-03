// CommentController.ts
import { Request, Response } from 'express';
import { CommentRepository } from '../../repositories/CommentRepository';
import { PublicationRepository } from '../../repositories/PublicationRepository';
import { CreateCommentUseCase } from '../../../application/UseCases/Comment/CreateCommentUseCase';

export class CommentController {
 private commentRepository: CommentRepository;
 private publicationRepository: PublicationRepository;
 private createCommentUseCase: CreateCommentUseCase;

 constructor() {
   this.commentRepository = new CommentRepository();
   this.publicationRepository = new PublicationRepository();
   this.createCommentUseCase = new CreateCommentUseCase(
     this.commentRepository,
     this.publicationRepository
   );
 }

 async createComment(req: Request & { user?: any }, res: Response): Promise<void> {
   try {
     const content = req.body.content;
     const publicationId = req.params.publicationId;
     const userId = req.user?.uuid;
     const userName = req.user?.Nombre;

     if (!content || !userId || !userName) {
       res.status(400).json({
         message: 'Faltan campos requeridos',
         details: {
           content: !content,
           userId: !userId,
           userName: !userName
         }
       });
       return;
     }

     const comment = await this.createCommentUseCase.execute(
       content,
       publicationId,
       { uuid: userId, Nombre: userName }
     );

     res.status(201).json({
       message: 'Comentario creado exitosamente',
       data: comment
     });
   } catch (error) {
     res.status(500).json({
       message: error instanceof Error ? error.message : 'Error desconocido'
     });
   }
 }

 async getCommentsByPublication(req: Request, res: Response): Promise<void> {
   try {
     const { publicationId } = req.params;
     const comments = await this.commentRepository.getCommentsByPublicationId(publicationId);
     res.json({ data: comments });
   } catch (error) {
     res.status(500).json({
       message: error instanceof Error ? error.message : 'Error desconocido'
     });
   }
 }

 async deleteComment(req: Request & { user?: any }, res: Response): Promise<void> {
   try {
     const commentId = parseInt(req.params.id);
     const userId = req.user?.uuid;

     const comment = await this.commentRepository.getCommentById(commentId);
     if (!comment) {
       res.status(404).json({ message: 'Comentario no encontrado' });
       return;
     }

     if (comment.userId !== userId) {
       res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
       return;
     }

     await this.commentRepository.deleteComment(commentId);
     res.json({ message: 'Comentario eliminado exitosamente' });
   } catch (error) {
     res.status(500).json({
       message: error instanceof Error ? error.message : 'Error desconocido'
     });
   }
 }
}