import { Router, Request, Response, NextFunction } from 'express';
import { ReviewService } from '../../application/ReviewService.js';
import { AppError } from '../../shared/errors/AppError.js';

export function createReviewRoutes(reviewService: ReviewService): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await reviewService.getAllReviews();
      res.json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  });

  router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await reviewService.getAverageRating();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  });

  router.get('/recent', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const reviews = await reviewService.getRecentReviews(limit);
      res.json({ success: true, data: reviews });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await reviewService.getReviewById(req.params.id);
      if (!review) throw new AppError('Review not found', 404);
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerName, rating, comment } = req.body;
      if (!customerName?.trim()) throw new AppError('Customer name is required', 400);
      if (!rating || rating < 1 || rating > 5) throw new AppError('Rating must be between 1 and 5', 400);

      const review = await reviewService.createReview({ customerName, rating, comment });
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await reviewService.deleteReview(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}