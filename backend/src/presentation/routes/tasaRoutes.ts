import { Router, Request, Response } from 'express';
import { ExchangeRateService } from '../../application/ExchangeRateService.js';

const router = Router();
const tasaService = new ExchangeRateService();

/**
 * GET /api/tasas - Obtiene todas las tasas de cambio
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const tasas = await tasaService.getAll();
    res.json(tasas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tasas/activa - Obtiene la tasa activa actual
 */
router.get('/activa', async (req: Request, res: Response) => {
  try {
    const tasa = await tasaService.getActive();
    if (!tasa) {
      return res.status(404).json({ error: 'No hay tasa de cambio activa' });
    }
    res.json(tasa);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tasas/:id - Obtiene una tasa por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const tasa = await tasaService.getById(req.params.id as string);
    if (!tasa) {
      return res.status(404).json({ error: 'Tasa no encontrada' });
    }
    res.json(tasa);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tasas - Crea una nueva tasa (la activa y desactiva las anteriores)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { tasa, moneda, monedaBase, creadaPor } = req.body;
    
    if (!tasa || tasa <= 0) {
      return res.status(400).json({ error: 'La tasa debe ser mayor a 0' });
    }

    const nuevaTasa = await tasaService.create({
      tasa: Number(tasa),
      moneda,
      monedaBase,
      creadaPor
    });
    
    res.status(201).json(nuevaTasa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/tasas/:id - Actualiza una tasa
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const tasa = await tasaService.update(req.params.id as string, req.body);
    res.json(tasa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/tasas/:id/activar - Activa una tasa
 */
router.put('/:id/activar', async (req: Request, res: Response) => {
  try {
    const tasa = await tasaService.activate(req.params.id as string);
    res.json(tasa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/tasas/:id - Elimina una tasa (solo si no está activa)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await tasaService.delete(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;