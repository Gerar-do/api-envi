// CommentRoutes.ts
import { Router, Request, Response } from 'express';
import { CommentController } from '../controllers/CommentController';
import { validateToken } from '../../middlewares/AuthMiddleware';

const router = Router();
const commentController = new CommentController();

router.post(
  '/:publicationId/create',
  validateToken,
  (req: Request, res: Response) => commentController.createComment(req, res)
);

router.get(
  '/:publicationId/comments',
  (req: Request, res: Response) => commentController.getCommentsByPublication(req, res)
);

router.delete(
  '/comments/:id',
  validateToken,
  (req: Request, res: Response) => commentController.deleteComment(req, res)
);

export default router;