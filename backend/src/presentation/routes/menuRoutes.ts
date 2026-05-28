import { Router, Request, Response, NextFunction } from 'express';
import { MenuService } from '../../application/MenuService.js';
import { Category } from '../../config/entities/Category.js';
import { AppError } from '../../shared/errors/AppError.js';

export function createMenuRoutes(menuService: MenuService): Router {
  const router = Router();

  // === Categories ===

  router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await menuService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  });

  router.get('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await menuService.getCategoryById(req.params.id);
      if (!category) throw new AppError('Category not found', 404);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  });

  router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, icon, displayOrder } = req.body;
      if (!name?.trim()) throw new AppError('Name is required', 400);
      
      const category = await menuService.createCategory({ name, description, icon, displayOrder });
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  });

  router.put('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await menuService.updateCategory(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await menuService.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // === Menu Items ===

  router.get('/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await menuService.getAllMenuItems();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  });

  router.get('/items/featured', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await menuService.getFeaturedItems();
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  });

  router.get('/items/category/:categoryId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await menuService.getMenuItemsByCategory(req.params.categoryId);
      res.json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  });

  router.get('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await menuService.getMenuItemById(req.params.id);
      if (!item) throw new AppError('Menu item not found', 404);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  router.post('/items', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, price, categoryId, imageUrl } = req.body;
      if (!name?.trim()) throw new AppError('Name is required', 400);
      if (!price || price <= 0) throw new AppError('Price must be greater than 0', 400);
      if (!categoryId?.trim()) throw new AppError('Category ID is required', 400);

      const item = await menuService.createMenuItem({ name, description, price, categoryId, imageUrl });
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  router.put('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await menuService.updateMenuItem(req.params.id, req.body);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/items/:id/availability', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await menuService.toggleMenuItemAvailability(req.params.id);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/items/:id/featured', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await menuService.toggleFeatured(req.params.id);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  });

  router.delete('/items/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await menuService.deleteMenuItem(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // === Full Menu ===

  router.get('/full', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fullMenu = await menuService.getFullMenu();
      res.json({ success: true, data: fullMenu });
    } catch (error) {
      next(error);
    }
  });

  return router;
}