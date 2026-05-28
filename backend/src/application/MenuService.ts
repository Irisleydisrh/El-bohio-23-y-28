import { Category } from '../config/entities/Category.js';
import { MenuItem } from '../config/entities/MenuItem.js';
import { CategoryRepository, MenuItemRepository } from './repositories/MenuRepository.js';

/**
 * Menu Service - Application Layer con TypeORM
 */
export class MenuService {
  private categoryRepo: CategoryRepository;
  private menuItemRepo: MenuItemRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
    this.menuItemRepo = new MenuItemRepository();
  }

  // === Categories ===

  async getAllCategories(): Promise<Category[]> {
    return this.categoryRepo.findAll();
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepo.findById(id);
  }

  async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    displayOrder?: number;
  }): Promise<Category> {
    const category = new Category();
    Object.assign(category, data);
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.categoryRepo.update(id, data);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.categoryRepo.delete(id);
  }

  // === Menu Items ===

  async getAllMenuItems(): Promise<MenuItem[]> {
    return this.menuItemRepo.findAll();
  }

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    return this.menuItemRepo.findById(id);
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    return this.menuItemRepo.findByCategoryId(categoryId);
  }

  async getFeaturedItems(): Promise<MenuItem[]> {
    return this.menuItemRepo.findFeatured();
  }

  async createMenuItem(data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
  }): Promise<MenuItem> {
    const item = new MenuItem();
    Object.assign(item, data);
    return this.menuItemRepo.save(item);
  }

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    return this.menuItemRepo.update(id, data);
  }

  async deleteMenuItem(id: string): Promise<void> {
    return this.menuItemRepo.delete(id);
  }

  async toggleMenuItemAvailability(id: string): Promise<MenuItem> {
    const item = await this.menuItemRepo.findById(id);
    if (!item) throw new Error('Menu item not found');
    item.available = !item.available;
    return this.menuItemRepo.save(item);
  }

  async toggleFeatured(id: string): Promise<MenuItem> {
    const item = await this.menuItemRepo.findById(id);
    if (!item) throw new Error('Menu item not found');
    item.featured = !item.featured;
    return this.menuItemRepo.save(item);
  }

  // === Full Menu ===

  async getFullMenu(): Promise<Array<{ category: Category; items: MenuItem[] }>> {
    const categories = await this.categoryRepo.findAll();
    const fullMenu = await Promise.all(
      categories.map(async (category) => ({
        category,
        items: await this.menuItemRepo.findByCategoryId(category.id),
      }))
    );
    return fullMenu;
  }
}