// src/infrastructure/controllers/PublicationController.ts
import { Request, Response } from 'express';
import { CreatePublicationUseCase } from '../../../application/UseCases/publication/CreatePublicationUseCase';
import { GetPublicationByIdUseCase } from '../../../application/UseCases/publication/GetPublicationByIdUseCase';
import { GetUserPublicationsUseCase } from '../../../application/UseCases/publication/GetUserPublicationsUseCase';
import { UpdatePublicationUseCase } from '../../../application/UseCases/publication/UpdatePublicationUseCase';
import { DeletePublicationUseCase } from '../../../application/UseCases/publication/DeletePublicationUseCase';
import { GetAllPublicationsUseCase } from '../../../application/UseCases/publication/GetAllPublicationsUseCase';
import { GetPublicationsByTypeUseCase } from '../../../application/UseCases/publication/GetPublicationsByTypeUseCase';
import { S3Service } from '../../services/S3Service';
import { IPublication } from '../../../domain/models/Publication';

export class PublicationController {
    constructor(
        private readonly createPublicationUseCase: CreatePublicationUseCase,
        private readonly getPublicationByIdUseCase: GetPublicationByIdUseCase,
        private readonly getUserPublicationsUseCase: GetUserPublicationsUseCase,
        private readonly updatePublicationUseCase: UpdatePublicationUseCase,
        private readonly deletePublicationUseCase: DeletePublicationUseCase,
        private readonly getAllPublicationsUseCase: GetAllPublicationsUseCase,
        private readonly getPublicationsByTypeUseCase: GetPublicationsByTypeUseCase,
        private readonly s3Service: S3Service,
    ) {}

    async createPublication(req: Request & { user?: any }, res: Response): Promise<void> {
      try {
          console.log('User from token:', req.user); // Para debug
          
          const { title, description, type, price } = req.body;
          const userId = req.user?.uuid; // Tomamos el uuid del token
  
          // Verificación de campos requeridos
          const missingFields = [];
          if (!title) missingFields.push('title');
          if (!description) missingFields.push('description');
          if (!type) missingFields.push('type');
          if (!userId) missingFields.push('userId from token');
  
          if (missingFields.length > 0) {
              res.status(400).json({ 
                  message: 'Faltan campos requeridos',
                  missingFields: missingFields,
                  receivedFields: {
                      ...req.body,
                      userIdFromToken: userId
                  }
              });
              return;
          }
  
          if (!req.file) {
              res.status(400).json({ message: 'Se requiere una imagen' });
              return;
          }
  
          const imageUrl = await this.s3Service.uploadImage(req.file);
  
          const publicationData: IPublication = {
              title,
              description,
              type: type as 'free' | 'paid',
              price: Number(price) || 0,
              userId: userId, // Usamos el uuid del token
              imageUrl
          };
  
          const publication = await this.createPublicationUseCase.execute(publicationData);
          res.status(201).json(publication);
      } catch (error) {
          console.error('Error creating publication:', error);
          res.status(500).json({ 
              message: 'Error al crear la publicación',
              
          });
      }
  }

    async updatePublication(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const updateData: Partial<IPublication> = { ...req.body };

            if (req.file) {
                const imageUrl = await this.s3Service.uploadImage(req.file);
                updateData.imageUrl = imageUrl;
            }

            const publication = await this.updatePublicationUseCase.execute(id, updateData);
            if (!publication) {
                res.status(404).json({ message: 'Publicación no encontrada' });
                return;
            }

            res.json(publication);
        } catch (error: any) {
            res.status(500).json({ 
                message: 'Error al actualizar la publicación',
                error: error.message 
            });
        }
    }

    async getPublicationById(req: Request, res: Response): Promise<void> {
        try {
            const publication = await this.getPublicationByIdUseCase.execute(req.params.id);
            if (!publication) {
                res.status(404).json({ message: 'Publicación no encontrada' });
                return;
            }
            res.json(publication);
        } catch (error: any) {
            res.status(500).json({ 
                message: 'Error al obtener la publicación',
                error: error.message 
            });
        }
    }

    async getUserPublications(req: Request, res: Response): Promise<void> {
        try {
            const publications = await this.getUserPublicationsUseCase.execute(req.params.userId);
            res.json(publications);
        } catch (error: any) {
            res.status(500).json({ 
                message: 'Error al obtener las publicaciones del usuario',
                error: error.message 
            });
        }
    }

    async getAllPublications(req: Request, res: Response): Promise<void> {
        try {
            const publications = await this.getAllPublicationsUseCase.execute();
            res.json(publications);
        } catch (error: any) {
            res.status(500).json({ 
                message: 'Error al obtener las publicaciones',
                error: error.message 
            });
        }
    }

    async getPublicationsByType(req: Request, res: Response): Promise<void> {
        try {
            const type = req.params.type as 'free' | 'paid';
            const publications = await this.getPublicationsByTypeUseCase.execute(type);
            res.json(publications);
        } catch (error: any) {
            res.status(500).json({ 
                message: 'Error al obtener las publicaciones por tipo',
                error: error.message 
            });
        }
    }

    async deletePublication(req: Request, res: Response): Promise<void> {
        try {
            await this.deletePublicationUseCase.execute(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ 
                message: 'Error al eliminar la publicación',
                error: error.message 
            });
        }
    }
}