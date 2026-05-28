import { Review } from '../entities/review/Review.js';

/**
 * Review Repository Interface
 */
export interface IReviewRepository {
  findAll(): Promise<Review[]>;
  findById(id: string): Promise<Review | null>;
  save(review: Review): Promise<Review>;
  delete(id: string): Promise<void>;
}