import { Router, Request, Response, NextFunction } from 'express';
import { ReservationService } from '../../application/ReservationService.js';
import { AppError } from '../../shared/errors/AppError.js';

export function createReservationRoutes(reservationService: ReservationService): Router {
  const router = Router();

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, date } = req.query;
      const reservations = status 
        ? await reservationService.getReservationsByStatus(status as string)
        : date 
          ? await reservationService.getReservationsByDate(date as string)
          : await reservationService.getAllReservations();
      res.json({ success: true, data: reservations });
    } catch (error) {
      next(error);
    }
  });

  router.get('/today', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservations = await reservationService.getTodayReservations();
      res.json({ success: true, data: reservations });
    } catch (error) {
      next(error);
    }
  });

  router.get('/pending', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservations = await reservationService.getPendingReservations();
      res.json({ success: true, data: reservations });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservation = await reservationService.getReservationById(req.params.id);
      if (!reservation) throw new AppError('Reservation not found', 404);
      res.json({ success: true, data: reservation });
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerName, customerPhone, guests, reservationDate, reservationTime } = req.body;
      if (!customerName?.trim()) throw new AppError('Customer name is required', 400);
      if (!customerPhone?.trim()) throw new AppError('Customer phone is required', 400);
      if (!guests || guests < 1 || guests > 20) throw new AppError('Guests must be between 1 and 20', 400);

      const reservation = await reservationService.createReservation({
        customerName,
        customerPhone,
        guests,
        reservationDate,
        reservationTime,
      });
      res.status(201).json({ success: true, data: reservation });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/confirm', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservation = await reservationService.confirmReservation(req.params.id);
      res.json({ success: true, data: reservation });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservation = await reservationService.cancelReservation(req.params.id);
      res.json({ success: true, data: reservation });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/complete', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservation = await reservationService.completeReservation(req.params.id);
      res.json({ success: true, data: reservation });
    } catch (error) {
      next(error);
    }
  });

  return router;
}