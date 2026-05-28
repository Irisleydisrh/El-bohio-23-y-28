import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { Review } from '../../config/entities/Review.js';

/**
 * Review Repository - TypeORM Implementation
 */
export class ReviewRepository {
  private repo: Repository<Review>;

  constructor() {
    this.repo = AppDataSource.getRepository(Review);
  }

  async findAll(): Promise<Review[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Review | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(review: Review): Promise<Review> {
    return this.repo.save(review);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async getAverageRating(): Promise<{ average: number; count: number }> {
    const reviews = await this.findAll();
    if (reviews.length === 0) return { average: 0, count: 0 };
    
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      count: reviews.length,
    };
  }
}