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

interface ICleanPublication {
    id: string;
    title: string;
    description: string;
    type: string;
    price: number;
    userId: string;
    imageUrl: string;
}

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

    private cleanPublicationData(publication: any): ICleanPublication {
        return {
            id: publication._id || publication.id,
            title: publication.title,
            description: publication.description,
            type: publication.type,
            price: publication.price,
            userId: publication.userId,
            imageUrl: publication.imageUrl
        };
    }

    private async addPresignedUrlToPublication(publication: any): Promise<any> {
        if (publication?.imageUrl) {
            try {
                const presignedUrl = await this.s3Service.getPresignedUrl(publication.imageUrl);
                return {
                    ...this.cleanPublicationData(publication),
                    imageUrl: presignedUrl
                };
            } catch (error) {
                console.error(`Error generating presigned URL for publication:`, error);
                return this.cleanPublicationData(publication);
            }
        }
        return this.cleanPublicationData(publication);
    }

    private async addPresignedUrlToPublications(publications: any[]): Promise<any[]> {
        return Promise.all(publications.map(pub => this.addPresignedUrlToPublication(pub)));
    }

    async createPublication(req: Request & { user?: any }, res: Response): Promise<void> {
        try {
            const { title, description, type, price } = req.body;
            const userId = req.user?.uuid;

            const missingFields = [];
            if (!title) missingFields.push('title');
            if (!description) missingFields.push('description');
            if (!type) missingFields.push('type');
            if (!userId) missingFields.push('userId from token');

            if (missingFields.length > 0) {
                res.status(400).json({ 
                    message: 'Faltan campos requeridos',
                    missingFields,
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

            const imageKey = await this.s3Service.uploadImage(req.file);

            const publicationData: IPublication = {
                title,
                description,
                type: type as 'free' | 'paid',
                price: Number(price) || 0,
                userId,
                imageUrl: imageKey
            };

            const publication = await this.createPublicationUseCase.execute(publicationData);
            const cleanPublication = await this.addPresignedUrlToPublication(publication);
            res.status(201).json({
                message: 'Publicación creada con éxito',
                data: cleanPublication
            });
        } catch (error) {
            console.error('Error creating publication:', error);
            res.status(500).json({ 
                message: 'Error al crear la publicación',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async updatePublication(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const updateData: Partial<IPublication> = { ...req.body };

            if (req.file) {
                const imageKey = await this.s3Service.uploadImage(req.file);
                updateData.imageUrl = imageKey;

                const currentPublication = await this.getPublicationByIdUseCase.execute(id);
                if (currentPublication?.imageUrl) {
                    await this.s3Service.deleteImage(currentPublication.imageUrl).catch(err => {
                        console.error('Error deleting old image:', err);
                    });
                }
            }

            const publication = await this.updatePublicationUseCase.execute(id, updateData);
            if (!publication) {
                res.status(404).json({ message: 'Publicación no encontrada' });
                return;
            }

            const cleanPublication = await this.addPresignedUrlToPublication(publication);
            res.json({
                message: 'Publicación modificada con éxito',
                data: cleanPublication
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error al actualizar la publicación',
                error: error instanceof Error ? error.message : 'Unknown error'
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
            const cleanPublication = await this.addPresignedUrlToPublication(publication);
            res.json(cleanPublication);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error al obtener la publicación',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getUserPublications(req: Request, res: Response): Promise<void> {
        try {
            const publications = await this.getUserPublicationsUseCase.execute(req.params.userId);
            const cleanPublications = await this.addPresignedUrlToPublications(publications);
            res.json(cleanPublications);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error al obtener las publicaciones del usuario',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getAllPublications(_: Request, res: Response): Promise<void> {
        try {
            const publications = await this.getAllPublicationsUseCase.execute();
            const cleanPublications = await this.addPresignedUrlToPublications(publications);
            res.json(cleanPublications);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error al obtener las publicaciones',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async getPublicationsByType(req: Request, res: Response): Promise<void> {
        try {
            const type = req.params.type as 'free' | 'paid';
            const publications = await this.getPublicationsByTypeUseCase.execute(type);
            const cleanPublications = await this.addPresignedUrlToPublications(publications);
            res.json(cleanPublications);
        } catch (error) {
            res.status(500).json({ 
                message: 'Error al obtener las publicaciones por tipo',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    async deletePublication(req: Request, res: Response): Promise<void> {
        try {
            const publication = await this.getPublicationByIdUseCase.execute(req.params.id);
            if (!publication) {
                res.status(404).json({ message: 'Publicación no encontrada' });
                return;
            }

            if (publication.imageUrl) {
                await this.s3Service.deleteImage(publication.imageUrl).catch(err => {
                    console.error('Error deleting image:', err);
                });
            }
            
            await this.deletePublicationUseCase.execute(req.params.id);
            res.status(200).json({ 
                message: 'Publicación eliminada con éxito'
            });
        } catch (error) {
            res.status(500).json({ 
                message: 'Error al eliminar la publicación',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}