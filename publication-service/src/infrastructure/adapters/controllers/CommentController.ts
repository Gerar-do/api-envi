// src/infrastructure/controllers/CommentController.ts

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

      // Validación de campos requeridos
      if (!content || !userId || !userName) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos',
          details: {
            content: !content,
            userId: !userId,
            userName: !userName
          }
        });
        return;
      }

      // Validación de longitud del contenido
      if (content.length < 2 || content.length > 1000) {
        res.status(400).json({
          success: false,
          message: 'El contenido debe tener entre 2 y 1000 caracteres'
        });
        return;
      }

      const comment = await this.createCommentUseCase.execute(
        content,
        publicationId,
        { uuid: userId, Nombre: userName }
      );

      res.status(201).json({
        success: true,
        message: 'Comentario creado exitosamente',
        data: comment
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Determinar el código de estado HTTP apropiado
      let statusCode = 500;
      if (errorMessage.includes('tóxico') || 
          errorMessage.includes('negativo') || 
          errorMessage.includes('inapropiado') ||
          errorMessage.includes('lenguaje')) {
        statusCode = 400;
      } else if (errorMessage.includes('no existe')) {
        statusCode = 404;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }

  async getCommentsByPublication(req: Request, res: Response): Promise<void> {
    try {
      const { publicationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Validar parámetros de paginación
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({
          success: false,
          message: 'Parámetros de paginación inválidos'
        });
        return;
      }

      const comments = await this.commentRepository.getCommentsByPublicationId(publicationId);
      const total = await this.commentRepository.countCommentsByPublication(publicationId);

      res.json({
        success: true,
        data: comments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async deleteComment(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user?.uuid;

      if (!commentId || isNaN(commentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de comentario inválido'
        });
        return;
      }

      const comment = await this.commentRepository.getCommentById(commentId);
      
      if (!comment) {
        res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
        return;
      }

      if (comment.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para eliminar este comentario'
        });
        return;
      }

      await this.commentRepository.deleteComment(commentId);
      
      res.json({
        success: true,
        message: 'Comentario eliminado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  async updateComment(req: Request & { user?: any }, res: Response): Promise<void> {
    try {
      const commentId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = req.user?.uuid;

      // Validaciones básicas
      if (!commentId || isNaN(commentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de comentario inválido'
        });
        return;
      }

      if (!content || content.length < 2 || content.length > 1000) {
        res.status(400).json({
          success: false,
          message: 'El contenido debe tener entre 2 y 1000 caracteres'
        });
        return;
      }

      // Verificar existencia del comentario y permisos
      const existingComment = await this.commentRepository.getCommentById(commentId);
      
      if (!existingComment) {
        res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
        return;
      }

      if (existingComment.userId !== userId) {
        res.status(403).json({
          success: false,
          message: 'No tienes permiso para editar este comentario'
        });
        return;
      }

      // Analizar el nuevo contenido
      const updatedComment = await this.createCommentUseCase.execute(
        content,
        existingComment.publicationId,
        { uuid: userId, Nombre: existingComment.userName }
      );

      res.json({
        success: true,
        message: 'Comentario actualizado exitosamente',
        data: updatedComment
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      let statusCode = 500;
      if (errorMessage.includes('tóxico') || 
          errorMessage.includes('negativo') || 
          errorMessage.includes('inapropiado')) {
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }
}