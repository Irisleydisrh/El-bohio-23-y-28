import { Router, Request, Response } from 'express';
import { TransaccionService } from '../../application/TransaccionService.js';

const router = Router();
const transaccionService = new TransaccionService();

/**
 * GET /api/transacciones - Obtiene todas las transacciones
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const transacciones = await transaccionService.getAll();
    res.json(transacciones);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transacciones/fecha - Obtiene transacciones por rango de fechas
 * Query: ?inicio=2024-01-01&fin=2024-01-31
 * IMPORTANTE: Debe estar ANTES de /:id para que Express no capture "fecha" como ID
 */
router.get('/fecha', async (req: Request, res: Response) => {
  try {
    const { inicio, fin } = req.query;
    
    if (!inicio || !fin) {
      return res.status(400).json({ error: 'Se requiere inicio y fin en formato YYYY-MM-DD' });
    }

    // Parsear fechas en UTC para evitar problemas de zona horaria
    // "2026-04-21" → 2026-04-21T00:00:00.000Z a 2026-04-21T23:59:59.999Z
    const [y, m, d] = (inicio as string).split('-').map(Number);
    const startDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    
    const [y2, m2, d2] = (fin as string).split('-').map(Number);
    const endDate = new Date(Date.UTC(y2, m2 - 1, d2, 23, 59, 59, 999));

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Fecha inválida' });
    }

    const transacciones = await transaccionService.getByDateRange(startDate, endDate);
    res.json(transacciones);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transacciones/numero/:numero - Obtiene una transacción por número
 */
router.get('/numero/:numero', async (req: Request, res: Response) => {
  try {
    const transaccion = await transaccionService.getByNumero(req.params.numero as string);
    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(transaccion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transacciones/mesa/:mesaId - Obtiene transacciones de una mesa
 */
router.get('/mesa/:mesaId', async (req: Request, res: Response) => {
  try {
    const transacciones = await transaccionService.getByMesa(req.params.mesaId as string);
    res.json(transacciones);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transacciones/cajera/:cajeraId - Obtiene transacciones de una cajera
 */
router.get('/cajera/:cajeraId', async (req: Request, res: Response) => {
  try {
    const transacciones = await transaccionService.getByCajera(req.params.cajeraId as string);
    res.json(transacciones);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transacciones/:id - Obtiene una transacción por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const transaccion = await transaccionService.getById(req.params.id as string);
    if (!transaccion) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(transaccion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/transacciones/cerrar - Cierra una mesa y crea la transacción
 */
router.post('/cerrar', async (req: Request, res: Response) => {
  try {
    const { 
      mesaId, 
      pedidoId, 
      cajeraId, 
      cajeraNombre, 
      descuento, 
      formaPago, 
      montoRecibidoLocal, 
      montoRecibidoUSD,
      notas 
    } = req.body;
    
    if (!mesaId || !pedidoId || !cajeraId || !cajeraNombre || !formaPago) {
      return res.status(400).json({ 
        error: 'Se requiere: mesaId, pedidoId, cajeraId, cajeraNombre, formaPago' 
      });
    }

    const result = await transaccionService.cerrarMesa({
      mesaId,
      pedidoId,
      cajeraId,
      cajeraNombre,
      descuento: Number(descuento) || 0,
      formaPago,
      montoRecibidoLocal: montoRecibidoLocal ? Number(montoRecibidoLocal) : undefined,
      montoRecibidoUSD: montoRecibidoUSD ? Number(montoRecibidoUSD) : undefined,
      notas
    });
    
    res.status(201).json({
      transaccion: result.transaccion,
      ticket: result.ticket
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/transacciones/:id/ticket - Obtiene el ticket de una transacción
 */
router.get('/:id/ticket', async (req: Request, res: Response) => {
  try {
    const ticket = await transaccionService.getTicket(req.params.id as string);
    if (!ticket) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/transacciones/ticket/:numero - Obtiene el ticket por número
 */
router.get('/ticket/numero/:numero', async (req: Request, res: Response) => {
  try {
    const ticket = await transaccionService.getTicketByNumero(req.params.numero as string);
    if (!ticket) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;