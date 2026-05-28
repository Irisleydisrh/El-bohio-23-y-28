import { Router, Request, Response } from 'express';
import { Categoria } from '../../config/entities/Categoria.js';
import { Producto } from '../../config/entities/Producto.js';
import { AppDataSource } from '../../config/dataSource.js';

const router = Router();

/**
 * GET /api-pos/categorias - Obtiene todas las categorías
 */
router.get('/categorias', async (req: Request, res: Response) => {
  try {
    const categoriaRepo = AppDataSource.getRepository(Categoria);
    const categorias = await categoriaRepo.find({ order: { orden: 'ASC' } });
    res.json(categorias);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api-pos/productos - Obtiene todos los productos activos
 */
router.get('/productos', async (req: Request, res: Response) => {
  try {
    const productoRepo = AppDataSource.getRepository(Producto);
    const productos = await productoRepo.find({ 
      where: { activo: true },
      relations: ['categoria'],
      order: { nombre: 'ASC' } 
    });
    res.json(productos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api-pos/productos/:id - Obtiene un producto por ID
 */
router.get('/productos/:id', async (req: Request, res: Response) => {
  try {
    const productoRepo = AppDataSource.getRepository(Producto);
    const producto = await productoRepo.findOne({ 
      where: { id: req.params.id },
      relations: ['categoria']
    });
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api-pos/categoria/:categoriaId/productos - Obtiene productos por categoría
 */
router.get('/categoria/:categoriaId/productos', async (req: Request, res: Response) => {
  try {
    const productoRepo = AppDataSource.getRepository(Producto);
    const productos = await productoRepo.find({ 
      where: { 
        categoriaId: req.params.categoriaId,
        activo: true 
      },
      order: { nombre: 'ASC' }
    });
    res.json(productos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api-pos/menu - Menú completo con categorías y productos
 */
router.get('/menu', async (req: Request, res: Response) => {
  try {
    const categoriaRepo = AppDataSource.getRepository(Categoria);
    const productoRepo = AppDataSource.getRepository(Producto);
    
    const categorias = await categoriaRepo.find({ order: { orden: 'ASC' } });
    const productos = await productoRepo.find({ where: { activo: true } });
    
    // Agrupar productos por categoría
    const menu = categorias.map(cat => ({
      category: cat,
      items: productos.filter(p => p.categoriaId === cat.id)
    }));
    
    res.json(menu);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;