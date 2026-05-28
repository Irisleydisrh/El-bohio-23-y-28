import { Reservation, ReservationStatus } from '../config/entities/Reservation.js';
import { ReservationRepository } from './repositories/ReservationRepository.js';

/**
 * Reservation Service - Application Layer
 */
export class ReservationService {
  private repo: ReservationRepository;

  constructor() {
    this.repo = new ReservationRepository();
  }

  async getAllReservations(): Promise<Reservation[]> {
    return this.repo.findAll();
  }

  async getReservationById(id: string): Promise<Reservation | null> {
    return this.repo.findById(id);
  }

  async getReservationsByDate(date: string): Promise<Reservation[]> {
    return this.repo.findByDate(date);
  }

  async getReservationsByStatus(status: string): Promise<Reservation[]> {
    return this.repo.findByStatus(status as ReservationStatus);
  }

  async createReservation(data: {
    customerName: string;
    customerPhone: string;
    guests: number;
    reservationDate: string;
    reservationTime: string;
  }): Promise<Reservation> {
    // Validar
    if (!data.customerName?.trim()) throw new Error('Customer name is required');
    if (!data.customerPhone?.trim()) throw new Error('Customer phone is required');
    if (!data.guests || data.guests < 1 || data.guests > 20) {
      throw new Error('Guests must be between 1 and 20');
    }
    if (!data.reservationDate?.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    if (!data.reservationTime?.match(/^\d{2}:\d{2}$/)) {
      throw new Error('Invalid time format. Use HH:MM');
    }

    const reservation = new Reservation();
    Object.assign(reservation, data);
    reservation.status = ReservationStatus.PENDING;

    return this.repo.save(reservation);
  }

  async confirmReservation(id: string): Promise<Reservation> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('Reservation not found');
    return this.repo.update(id, { status: ReservationStatus.CONFIRMED });
  }

  async cancelReservation(id: string): Promise<Reservation> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('Reservation not found');
    return this.repo.update(id, { status: ReservationStatus.CANCELLED });
  }

  async completeReservation(id: string): Promise<Reservation> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('Reservation not found');
    return this.repo.update(id, { status: ReservationStatus.COMPLETED });
  }

  async getPendingReservations(): Promise<Reservation[]> {
    return this.repo.findByStatus(ReservationStatus.PENDING);
  }

  async getTodayReservations(): Promise<Reservation[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.repo.findByDate(today);
  }
}