// src/infrastructure/routes/PublicationRoutes.ts
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

const multerStorage: StorageEngine = multer.memoryStorage();
const upload = multer({
    storage: multerStorage,  // Usamos multerStorage en lugar de storage
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
}).single('imagen');

// Middleware para manejar errores de multer
const uploadMiddleware = (req: any, res: any, next: any) => {
  upload(req, res, function (err) {
      console.log('Form fields received:', req.body);
      console.log('Files received:', req.files);
      console.log('Single file:', req.file);
      
      if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
              return res.status(400).json({
                  message: 'Campo de archivo incorrecto',
                  details: 'Use el nombre "imagen" para el campo del archivo',
                  error: err.message
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
      
      if (!req.file) {
          return res.status(400).json({
              message: 'No se encontró ningún archivo',
              tip: 'Asegúrese de enviar un archivo con el nombre "imagen"'
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
        uploadMiddleware,
        publicationController.updatePublication.bind(publicationController)
    );

    router.delete('/:id', 
        validateToken, 
        publicationController.deletePublication.bind(publicationController)
    );

    return router;
};

export default setupPublicationRoutes;