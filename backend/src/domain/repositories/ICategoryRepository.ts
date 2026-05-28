import { Category, CategoryProps } from '../entities/menu/Category.js';
import { MenuItem, MenuItemProps } from '../entities/menu/MenuItem.js';

/**
 * Category Repository Interface
 * Define el contrato para acceder a datos de categorías
 * Siguiendo el patrón Repository de DDD
 */
export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByDisplayOrder(): Promise<Category[]>;
  save(category: Category): Promise<Category>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}

/**
 * MenuItem Repository Interface
 * Define el contrato para acceder a datos de items del menú
 */
export interface IMenuItemRepository {
  findAll(): Promise<MenuItem[]>;
  findById(id: string): Promise<MenuItem | null>;
  findByCategoryId(categoryId: string): Promise<MenuItem[]>;
  findFeatured(): Promise<MenuItem[]>;
  save(item: MenuItem): Promise<MenuItem>;
  update(item: MenuItem): Promise<MenuItem>;
  delete(id: string): Promise<void>;
}