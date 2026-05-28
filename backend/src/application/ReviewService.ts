import { Review } from '../config/entities/Review.js';
import { ReviewRepository } from './repositories/ReviewRepository.js';

/**
 * Review Service - Application Layer
 */
export class ReviewService {
  private repo: ReviewRepository;

  constructor() {
    this.repo = new ReviewRepository();
  }

  async getAllReviews(): Promise<Review[]> {
    return this.repo.findAll();
  }

  async getReviewById(id: string): Promise<Review | null> {
    return this.repo.findById(id);
  }

  async createReview(data: {
    customerName: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    if (!data.customerName?.trim()) throw new Error('Customer name is required');
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = new Review();
    review.customerName = data.customerName;
    review.rating = data.rating;
    review.comment = data.comment;

    return this.repo.save(review);
  }

  async deleteReview(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async getAverageRating(): Promise<{ average: number; count: number }> {
    return this.repo.getAverageRating();
  }

  async getRecentReviews(limit: number = 5): Promise<Review[]> {
    const all = await this.repo.findAll();
    return all.slice(0, limit);
  }
}