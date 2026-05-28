import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Reservation Entity - TypeORM
 */
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  customerName!: string;

  @Column({ type: 'varchar', length: 20 })
  customerPhone!: string;

  @Column({ type: 'int', default: 1 })
  guests!: number;

  @Column({ type: 'date' })
  reservationDate!: string;

  @Column({ type: 'time' })
  reservationTime!: string;

  @Column({ 
    type: 'enum', 
    enum: ReservationStatus, 
    default: ReservationStatus.PENDING 
  })
  status!: ReservationStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}