// application/UseCases/Comment/CreateCommentUseCase.ts

import { IComment } from '../../../domain/models/Comments';
import { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import { PublicationRepository } from '../../../infrastructure/repositories/PublicationRepository';
import { BetoAnalysisService } from '../../../infrastructure/services/BetoAnalysisService';

export class CreateCommentUseCase {
  private readonly betoService: BetoAnalysisService;

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly publicationRepository: PublicationRepository
  ) {
    this.betoService = new BetoAnalysisService();
  }

  private validateContent(content: string): void {
    if (!content) {
      throw new Error('El contenido es requerido');
    }

    if (content.trim().length === 0) {
      throw new Error('El contenido no puede estar vacío');
    }

    if (content.length < 2) {
      throw new Error('El contenido es demasiado corto');
    }

    if (content.length > 1000) {
      throw new Error('El contenido excede el límite de caracteres permitido');
    }
  }

  private validateUserData(userData: { uuid: string; Nombre: string }): void {
    if (!userData.uuid || !userData.Nombre) {
      throw new Error('La información del usuario es incompleta');
    }
  }

  async execute(
    content: string,
    publicationId: string,
    userData: { uuid: string; Nombre: string }
  ): Promise<IComment> {
    try {
      // Validaciones iniciales
      this.validateContent(content);
      this.validateUserData(userData);

      // Verificar publicación
      const publication = await this.publicationRepository.getPublicationById(publicationId);
      if (!publication) {
        throw new Error('La publicación no existe');
      }

      // Analizar el texto con BETO
      const analysis = await this.betoService.analyzeText(content);

      // Validar contenido tóxico
      if (this.betoService.isToxic(analysis.toxicityScore)) {
        throw new Error('El contenido ha sido detectado como inapropiado o tóxico');
      }

      // Validar sentimiento muy negativo
      if (analysis.sentiment <= 1) {
        throw new Error('El contenido es demasiado negativo para ser publicado');
      }

      // Crear el comentario
      const commentData: IComment = {
        publicationId: publicationId.toString(),
        userId: userData.uuid,
        userName: userData.Nombre,
        content: content.trim(),
        sentiment: analysis.sentiment,
        toxicityScore: analysis.toxicityScore
      };

      // Guardar en base de datos
      const savedComment = await this.commentRepository.createComment(commentData);

      // Verificar que se guardó correctamente
      if (!savedComment) {
        throw new Error('Error al guardar el comentario');
      }

      return savedComment;

    } catch (error) {
      // Manejo de errores específicos
      if (error instanceof Error) {
        // Personalizar mensajes de error según el tipo
        if (error.message.includes('API key')) {
          throw new Error('Error en el servicio de análisis de contenido');
        }
        if (error.message.includes('ECONNREFUSED')) {
          throw new Error('Error de conexión con el servicio de análisis');
        }
        throw new Error(`Error al procesar el comentario: ${error.message}`);
      }
      // Error genérico
      throw new Error('Error inesperado al procesar el comentario');
    }
  }
}