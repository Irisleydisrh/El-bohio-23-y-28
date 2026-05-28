import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { Category } from '../../config/entities/Category.js';
import { MenuItem } from '../../config/entities/MenuItem.js';

/**
 * Menu Repository - TypeORM Implementation
 */
export class CategoryRepository {
  private repo: Repository<Category>;

  constructor() {
    this.repo = AppDataSource.getRepository(Category);
  }

  async findAll(): Promise<Category[]> {
    return this.repo.find({ order: { displayOrder: 'ASC' } });
  }

  async findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(category: Category): Promise<Category> {
    return this.repo.save(category);
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Category>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

export class MenuItemRepository {
  private repo: Repository<MenuItem>;

  constructor() {
    this.repo = AppDataSource.getRepository(MenuItem);
  }

  async findAll(): Promise<MenuItem[]> {
    return this.repo.find({ 
      relations: ['category'],
      order: { name: 'ASC' } 
    });
  }

  async findById(id: string): Promise<MenuItem | null> {
    return this.repo.findOne({ 
      where: { id },
      relations: ['category']
    });
  }

  async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
    return this.repo.find({ 
      where: { categoryId, available: true },
      order: { name: 'ASC' }
    });
  }

  async findFeatured(): Promise<MenuItem[]> {
    return this.repo.find({ 
      where: { featured: true, available: true },
      order: { name: 'ASC' }
    });
  }

  async save(item: MenuItem): Promise<MenuItem> {
    return this.repo.save(item);
  }

  async update(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<MenuItem>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}