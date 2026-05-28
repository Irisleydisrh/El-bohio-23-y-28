import { Router, Request, Response } from 'express';
import { MesaService } from '../../application/MesaService.js';
import { MesaEstado } from '../../config/entities/Mesa.js';

const router = Router();
const mesaService = new MesaService();

/**
 * GET /api/mesas - Obtiene todas las mesas
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const mesas = await mesaService.getAll();
    res.json(mesas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mesas/:id - Obtiene una mesa por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const mesa = await mesaService.getById(req.params.id as string);
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    res.json(mesa);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mesas/estado/:estado - Obtiene mesas por estado
 */
router.get('/estado/:estado', async (req: Request, res: Response) => {
  try {
    const estado = req.params.estado as MesaEstado;
    if (!Object.values(MesaEstado).includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const mesas = await mesaService.getByEstado(estado);
    res.json(mesas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mesas - Crea una nueva mesa
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { numero, capacidad, nombre, posicionX, posicionY } = req.body;
    
    if (!numero || numero < 1) {
      return res.status(400).json({ error: 'El número de mesa es requerido' });
    }

    const mesa = await mesaService.create({
      numero,
      capacidad,
      nombre,
      posicionX,
      posicionY
    });
    
    res.status(201).json(mesa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/mesas/:id - Actualiza una mesa
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const mesa = await mesaService.update(req.params.id as string, req.body);
    res.json(mesa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/mesas/:id/ocupar - Ocupa una mesa
 */
router.put('/:id/ocupar', async (req: Request, res: Response) => {
  try {
    const mesa = await mesaService.ocupar(req.params.id as string);
    res.json(mesa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/mesas/:id/liberar - Libera una mesa
 */
router.put('/:id/liberar', async (req: Request, res: Response) => {
  try {
    const mesa = await mesaService.liberar(req.params.id as string);
    res.json(mesa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/mesas/:id/cobrar - Marca mesa para cobrar
 */
router.put('/:id/cobrar', async (req: Request, res: Response) => {
  try {
    const mesa = await mesaService.marcarParaCobrar(req.params.id as string);
    res.json(mesa);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/mesas/:id - Elimina una mesa
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await mesaService.delete(req.params.id as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;