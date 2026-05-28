import { Review } from '../../domain/entities/review/Review.js';
import { type IReviewRepository } from '../../domain/repositories/IReviewRepository.js';
import supabase from '../supabase/client.js';

export class SupabaseReviewRepository implements IReviewRepository {
  async findAll(): Promise<Review[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch reviews: ${error.message}`);

    return (data || []).map(row => new Review({
      id: row.id,
      customerName: row.customer_name,
      rating: row.rating,
      comment: row.comment,
      createdAt: new Date(row.created_at),
    }));
  }

  async findById(id: string): Promise<Review | null> {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch review: ${error.message}`);
    }

    return new Review({
      id: data.id,
      customerName: data.customer_name,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date(data.created_at),
    });
  }

  async save(review: Review): Promise<Review> {
    const plain = review.toPlain();
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        id: plain.id,
        customer_name: plain.customerName,
        rating: plain.rating,
        comment: plain.comment,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create review: ${error.message}`);

    return new Review({
      id: data.id,
      customerName: data.customer_name,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date(data.created_at),
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete review: ${error.message}`);
  }
}