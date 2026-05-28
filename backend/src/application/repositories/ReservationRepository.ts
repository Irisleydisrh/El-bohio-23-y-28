import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { Reservation, ReservationStatus } from '../../config/entities/Reservation.js';

/**
 * Reservation Repository - TypeORM Implementation
 */
export class ReservationRepository {
  private repo: Repository<Reservation>;

  constructor() {
    this.repo = AppDataSource.getRepository(Reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByDate(date: string): Promise<Reservation[]> {
    return this.repo.find({ 
      where: { reservationDate: date },
      order: { reservationTime: 'ASC' }
    });
  }

  async findByStatus(status: ReservationStatus): Promise<Reservation[]> {
    return this.repo.find({ 
      where: { status },
      order: { createdAt: 'DESC' }
    });
  }

  async save(reservation: Reservation): Promise<Reservation> {
    return this.repo.save(reservation);
  }

  async update(id: string, data: Partial<Reservation>): Promise<Reservation> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Reservation>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}