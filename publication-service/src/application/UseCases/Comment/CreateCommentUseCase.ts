// src/application/UseCases/Comment/CreateCommentUseCase.ts

import { IComment } from '../../../domain/models/Comments';
import { CommentRepository } from '../../../infrastructure/repositories/CommentRepository';
import { PublicationRepository } from '../../../infrastructure/repositories/PublicationRepository';

export class CreateCommentUseCase {
  private offensiveWords = [
    'puto', 'puta', 'mierda', 'pendejo', 'idiota',
    'estupido', 'estúpido', 'imbecil', 'imbécil', 'verga',
    'joto', 'maricon', 'maricón', 'chinga', 'culero'
  ];

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly publicationRepository: PublicationRepository
  ) {}

  private containsOffensiveWords(content: string): boolean {
    const normalizedContent = content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return this.offensiveWords.some(word => 
      normalizedContent.includes(word.toLowerCase())
    );
  }

  async execute(content: string, publicationId: string, userData: { uuid: string, Nombre: string }): Promise<IComment> {
    if (this.containsOffensiveWords(content)) {
      throw new Error('El comentario contiene lenguaje inapropiado');
    }

    const publication = await this.publicationRepository.getPublicationById(publicationId);
    if (!publication) {
      throw new Error('La publicación no existe');
    }

    const commentData: IComment = {
      publicationId: publicationId.toString(),
      userId: userData.uuid,
      userName: userData.Nombre,
      content
    };

    return await this.commentRepository.createComment(commentData);
  }
}