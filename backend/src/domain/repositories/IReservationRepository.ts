import { Reservation, ReservationProps } from '../entities/reservation/Reservation.js';

/**
 * Reservation Repository Interface
 */
export interface IReservationRepository {
  findAll(): Promise<Reservation[]>;
  findById(id: string): Promise<Reservation | null>;
  findByDate(date: string): Promise<Reservation[]>;
  findByStatus(status: string): Promise<Reservation[]>;
  save(reservation: Reservation): Promise<Reservation>;
  update(reservation: Reservation): Promise<Reservation>;
  delete(id: string): Promise<void>;
}