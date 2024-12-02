import express, { Router } from 'express';
import multer from 'multer';
import { StorageEngine } from 'multer';
import { PublicationController } from '../controllers/PublicationController';
import { validateToken } from '../../middlewares/AuthMiddleware';
import { CreatePublicationUseCase } from '../../../application/UseCases/publication/CreatePublicationUseCase';
import { GetPublicationByIdUseCase } from '../../../application/UseCases/publication/GetPublicationByIdUseCase';
import { GetUserPublicationsUseCase } from '../../../application/UseCases/publication/GetUserPublicationsUseCase';
import { UpdatePublicationUseCase } from '../../../application/UseCases/publication/UpdatePublicationUseCase';
import { DeletePublicationUseCase } from '../../../application/UseCases/publication/DeletePublicationUseCase';
import { GetAllPublicationsUseCase } from '../../../application/UseCases/publication/GetAllPublicationsUseCase';
import { GetPublicationsByTypeUseCase } from '../../../application/UseCases/publication/GetPublicationsByTypeUseCase';
import { PublicationRepository } from '../../repositories/PublicationRepository';
import { S3Service } from '../../services/S3Service';

const router = express.Router();

// Configuración de Multer para el almacenamiento en memoria
const multerStorage: StorageEngine = multer.memoryStorage();

// Configuración de Multer para el manejo de archivos
const upload = multer({
    storage: multerStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
}).single('image'); // Cambiado a 'image' para mayor consistencia

// Middleware mejorado para el manejo de subida de archivos
const uploadMiddleware = (req: any, res: any, next: any) => {
    upload(req, res, function (err) {
        // Logs para debugging
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);

        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'El archivo es demasiado grande',
                    details: 'El tamaño máximo permitido es 5MB'
                });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    message: 'Campo de archivo incorrecto',
                    details: 'Use el nombre "image" para el campo del archivo'
                });
            }
            return res.status(400).json({
                message: 'Error al subir el archivo',
                error: err.message
            });
        } else if (err) {
            return res.status(500).json({
                message: 'Error al procesar el archivo',
                error: err.message
            });
        }

        // Solo validar el archivo si la ruta lo requiere
        const isCreateRoute = req.path === '/create';
        if (isCreateRoute && !req.file) {
            return res.status(400).json({
                message: 'Se requiere una imagen',
                details: 'Debe enviar una imagen con el campo "image"'
            });
        }

        next();
    });
};

// Inicialización de servicios y casos de uso
const publicationRepository = new PublicationRepository();
const s3Service = new S3Service();

const publicationController = new PublicationController(
    new CreatePublicationUseCase(publicationRepository),
    new GetPublicationByIdUseCase(publicationRepository),
    new GetUserPublicationsUseCase(publicationRepository),
    new UpdatePublicationUseCase(publicationRepository),
    new DeletePublicationUseCase(publicationRepository),
    new GetAllPublicationsUseCase(publicationRepository),
    new GetPublicationsByTypeUseCase(publicationRepository),
    s3Service
);

// Configuración de rutas
const setupPublicationRoutes = (): Router => {
    // Rutas públicas
    router.get('/', publicationController.getAllPublications.bind(publicationController));
    router.get('/type/:type', publicationController.getPublicationsByType.bind(publicationController));

    // Rutas protegidas
    router.post('/create', 
        validateToken, 
        uploadMiddleware, 
        publicationController.createPublication.bind(publicationController)
    );

    router.get('/:id', 
        validateToken, 
        publicationController.getPublicationById.bind(publicationController)
    );

    router.get('/user/:userId', 
        validateToken, 
        publicationController.getUserPublications.bind(publicationController)
    );

    router.put('/:id', 
        validateToken, 
        uploadMiddleware,  // El middleware ahora es más flexible con el PUT
        publicationController.updatePublication.bind(publicationController)
    );

    router.delete('/:id', 
        validateToken, 
        publicationController.deletePublication.bind(publicationController)
    );

    return router;
};

export default setupPublicationRoutes;