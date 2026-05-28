import { Router, Request, Response } from 'express';
import { CajaService } from '../../application/CajaService.js';

const router = Router();
const cajaService = new CajaService();

/**
 * GET /api/caja - Estado actual de la caja
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const caja = await cajaService.getAbierta();
    res.json(caja);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/caja/hoy - Caja del día actual
 */
router.get('/hoy', async (req: Request, res: Response) => {
  try {
    const caja = await cajaService.getDelDia();
    res.json(caja);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/caja/abrir - Abrir caja
 */
router.post('/abrir', async (req: Request, res: Response) => {
  try {
    const { cajeroId, cajeroNombre, aperturaLocal, aperturaUSD } = req.body;
    
    if (!cajeroId || !cajeroNombre) {
      return res.status(400).json({ error: 'cajeroId y cajeroNombre son requeridos' });
    }

    const caja = await cajaService.abrir({
      cajeroId,
      cajeroNombre,
      aperturaLocal: Number(aperturaLocal) || 0,
      aperturaUSD: Number(aperturaUSD) || 0,
    });

    res.status(201).json(caja);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/caja/cerrar - Cerrar caja
 */
router.post('/cerrar', async (req: Request, res: Response) => {
  try {
    const { observaciones } = req.body;
    const caja = await cajaService.cerrar({ observaciones });
    res.json(caja);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;