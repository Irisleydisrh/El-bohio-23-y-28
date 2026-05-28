import { Router, Request, Response } from 'express';
import { PedidoService } from '../../application/PedidoService.js';
import { PedidoEstado } from '../../config/entities/Pedido.js';

const router = Router();
const pedidoService = new PedidoService();

/**
 * GET /api/pedidos - Obtiene todos los pedidos
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const pedidos = await pedidoService.getAll();
    res.json(pedidos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pedidos/activos - Obtiene todos los pedidos activos
 */
router.get('/activos', async (req: Request, res: Response) => {
  try {
    const pedidos = await pedidoService.getAllActivos();
    res.json(pedidos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pedidos/por-cobrar - Obtiene todos los pedidos por cobrar
 */
router.get('/por-cobrar', async (req: Request, res: Response) => {
  try {
    const pedidos = await pedidoService.getAllPorCobrar();
    res.json(pedidos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pedidos/:id - Obtiene un pedido por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pedido = await pedidoService.getById(req.params.id as string);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    res.json(pedido);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pedidos/mesa/:mesaId - Obtiene pedidos de una mesa
 */
router.get('/mesa/:mesaId', async (req: Request, res: Response) => {
  try {
    const pedidos = await pedidoService.getByMesa(req.params.mesaId as string);
    res.json(pedidos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pedidos/mesa/:mesaId/activo - Obtiene el pedido activo de una mesa
 */
router.get('/mesa/:mesaId/activo', async (req: Request, res: Response) => {
  try {
    const pedido = await pedidoService.getActivoByMesa(req.params.mesaId as string);
    if (!pedido) {
      return res.status(404).json({ error: 'No hay pedido activo en esta mesa' });
    }
    res.json(pedido);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/pedidos - Crea un nuevo pedido
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { mesaId, meseraId, items, descuento } = req.body;
    
    if (!mesaId || !meseraId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere mesaId, meseraId y al menos un item' });
    }

    const pedido = await pedidoService.create({
      mesaId,
      meseraId,
      items,
      descuento
    });
    
    res.status(201).json(pedido);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/pedidos/:id/items - Agrega items a un pedido
 */
router.post('/:id/items', async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un item' });
    }

    const pedidoItems = await pedidoService.addItems(req.params.id as string, items);
    res.status(201).json(pedidoItems);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/pedidos/:id/estado - Cambia el estado del pedido
 */
router.put('/:id/estado', async (req: Request, res: Response) => {
  try {
    const { estado } = req.body;
    
    if (!estado || !Object.values(PedidoEstado).includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const pedido = await pedidoService.updateEstado(req.params.id as string, estado);
    res.json(pedido);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/pedidos/:id/para-cobrar - Marca el pedido para cobrar
 */
router.put('/:id/para-cobrar', async (req: Request, res: Response) => {
  try {
    const pedido = await pedidoService.marcarParaCobrar(req.params.id as string);
    res.json(pedido);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/pedidos/:id/cancelar - Cancela el pedido
 */
router.put('/:id/cancelar', async (req: Request, res: Response) => {
  try {
    const pedido = await pedidoService.cancelar(req.params.id as string);
    res.json(pedido);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/pedidos/:id/cerrar - Cierra el pedido (después del pago)
 */
router.put('/:id/cerrar', async (req: Request, res: Response) => {
  try {
    const pedido = await pedidoService.cerrar(req.params.id as string);
    res.json(pedido);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/pedidos/:id/descuento - Aplica descuento al pedido
 */
router.put('/:id/descuento', async (req: Request, res: Response) => {
  try {
    const { descuento } = req.body;
    
    if (descuento === undefined || descuento < 0) {
      return res.status(400).json({ error: 'El descuento debe ser >= 0' });
    }

    const pedido = await pedidoService.aplicarDescuento(req.params.id as string, Number(descuento));
    res.json(pedido);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/pedidos/items/:itemId - Actualiza cantidad de un item
 */
router.put('/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { cantidad } = req.body;
    
    if (!cantidad || cantidad < 1) {
      return res.status(400).json({ error: 'La cantidad debe ser >= 1' });
    }

    const item = await pedidoService.updateItemCantidad(req.params.itemId as string, cantidad);
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/pedidos/items/:itemId - Elimina un item del pedido
 */
router.delete('/items/:itemId', async (req: Request, res: Response) => {
  try {
    await pedidoService.removeItem(req.params.itemId as string);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/pedidos/:id/items - Obtiene los items de un pedido
 */
router.get('/:id/items', async (req: Request, res: Response) => {
  try {
    const items = await pedidoService.getItems(req.params.id as string);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;