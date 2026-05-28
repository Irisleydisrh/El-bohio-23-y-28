import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../../application/OrderService.js';
import { AppError } from '../../shared/errors/AppError.js';

export function createOrderRoutes(orderService: OrderService): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query;
      const orders = status 
        ? await orderService.getOrdersByStatus(status as string)
        : await orderService.getAllOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  });

  router.get('/pending', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await orderService.getPendingOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  });

  router.get('/active', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await orderService.getActiveOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) throw new AppError('Order not found', 404);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  });

  router.get('/number/:orderNumber', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.getOrderByNumber(req.params.orderNumber);
      if (!order) throw new AppError('Order not found', 404);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerName, customerPhone, orderType, deliveryAddress, items } = req.body;
      if (!items?.length) throw new AppError('Items array is required', 400);

      const order = await orderService.createOrder({
        customerName,
        customerPhone,
        orderType,
        deliveryAddress,
        items,
      });
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      if (!status) throw new AppError('Status is required', 400);

      const order = await orderService.updateOrderStatus(req.params.id, status);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.cancelOrder(req.params.id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  });

  return router;
}