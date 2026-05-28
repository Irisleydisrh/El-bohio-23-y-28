import { Category, type CategoryProps } from '../../domain/entities/menu/Category.js';
import { type ICategoryRepository } from '../../domain/repositories/ICategoryRepository.js';
import supabase from '../supabase/client.js';

export class SupabaseCategoryRepository implements ICategoryRepository {
  async findAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
    
    return (data || []).map(row => new Category({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      displayOrder: row.display_order,
      createdAt: new Date(row.created_at),
    }));
  }

  async findById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch category: ${error.message}`);
    }

    return new Category({
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      displayOrder: data.display_order,
      createdAt: new Date(data.created_at),
    });
  }

  async findByDisplayOrder(): Promise<Category[]> {
    return this.findAll();
  }

  async save(category: Category): Promise<Category> {
    const plain = category.toPlain();
    const { data, error } = await supabase
      .from('menu_categories')
      .insert({
        id: plain.id,
        name: plain.name,
        description: plain.description,
        icon: plain.icon,
        display_order: plain.displayOrder,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create category: ${error.message}`);

    return new Category({
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      displayOrder: data.display_order,
      createdAt: new Date(data.created_at),
    });
  }

  async update(category: Category): Promise<Category> {
    const plain = category.toPlain();
    const { data, error } = await supabase
      .from('menu_categories')
      .update({
        name: plain.name,
        description: plain.description,
        icon: plain.icon,
        display_order: plain.displayOrder,
      })
      .eq('id', plain.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update category: ${error.message}`);

    return new Category({
      id: data.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      displayOrder: data.display_order,
      createdAt: new Date(data.created_at),
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }
}