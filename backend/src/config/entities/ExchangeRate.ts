import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Moneda {
  LOCAL = 'CUP',
  USD = 'USD',
}

/**
 * ExchangeRate Entity - TypeORM
 * Stores the daily USD exchange rate
 * Only ONE active rate at a time
 */
@Entity('tasas_cambio')
export class ExchangeRate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  tasa!: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  moneda!: string;

  @Column({ type: 'varchar', length: 10, default: 'CUP' })
  monedaBase!: string;

  @Column({ type: 'boolean', default: true })
  activa!: boolean;

  @Column({ type: 'uuid', nullable: true })
  creadaPor!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}