import { MenuItem } from '../../domain/entities/menu/MenuItem.js';
import { type IMenuItemRepository } from '../../domain/repositories/ICategoryRepository.js';
import supabase from '../supabase/client.js';

export class SupabaseMenuItemRepository implements IMenuItemRepository {
  async findAll(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch menu items: ${error.message}`);
    
    return (data || []).map(row => new MenuItem({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      available: row.available,
      featured: row.featured,
      createdAt: new Date(row.created_at),
    }));
  }

  async findById(id: string): Promise<MenuItem | null> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch menu item: ${error.message}`);
    }

    return new MenuItem({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.category_id,
      imageUrl: data.image_url,
      available: data.available,
      featured: data.featured,
      createdAt: new Date(data.created_at),
    });
  }

  async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('available', true)
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch menu items: ${error.message}`);
    
    return (data || []).map(row => new MenuItem({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      available: row.available,
      featured: row.featured,
      createdAt: new Date(row.created_at),
    }));
  }

  async findFeatured(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('featured', true)
      .eq('available', true)
      .order('name', { ascending: true });

    if (error) throw new Error(`Failed to fetch featured items: ${error.message}`);
    
    return (data || []).map(row => new MenuItem({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      categoryId: row.category_id,
      imageUrl: row.image_url,
      available: row.available,
      featured: row.featured,
      createdAt: new Date(row.created_at),
    }));
  }

  async save(item: MenuItem): Promise<MenuItem> {
    const plain = item.toPlain();
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        id: plain.id,
        name: plain.name,
        description: plain.description,
        price: plain.price,
        category_id: plain.categoryId,
        image_url: plain.imageUrl,
        available: plain.available,
        featured: plain.featured,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create menu item: ${error.message}`);

    return new MenuItem({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.category_id,
      imageUrl: data.image_url,
      available: data.available,
      featured: data.featured,
      createdAt: new Date(data.created_at),
    });
  }

  async update(item: MenuItem): Promise<MenuItem> {
    const plain = item.toPlain();
    const { data, error } = await supabase
      .from('menu_items')
      .update({
        name: plain.name,
        description: plain.description,
        price: plain.price,
        category_id: plain.categoryId,
        image_url: plain.imageUrl,
        available: plain.available,
        featured: plain.featured,
      })
      .eq('id', plain.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update menu item: ${error.message}`);

    return new MenuItem({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.category_id,
      imageUrl: data.image_url,
      available: data.available,
      featured: data.featured,
      createdAt: new Date(data.created_at),
    });
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete menu item: ${error.message}`);
  }
}