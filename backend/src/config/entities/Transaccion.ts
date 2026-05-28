import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';
import { Mesa } from './Mesa.js';

export enum FormaPago {
  EFECTIVO_LOCAL = 'efectivo_local',
  EFECTIVO_USD = 'efectivo_usd',
  MIXTO = 'mixto',
  TARJETA = 'tarjeta',
}

/**
 * Transaccion Entity - TypeORM
 * Complete transaction record with all fields required
 */
@Entity('transacciones')
export class Transaccion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  numeroTransaccion!: string;

  @Column({ type: 'uuid' })
  mesaId!: string;

  @ManyToOne(() => Mesa)
  @JoinColumn({ name: 'mesaId' })
  mesa!: Mesa;

  @Column({ type: 'int' })
  mesaNumero!: number;

  @Column({ type: 'uuid' })
  cajeraId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cajeraId' })
  cajera!: User;

  @Column({ type: 'varchar', length: 100 })
  cajeraNombre!: string;

  @Column({ type: 'uuid' })
  pedidoId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuento!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalLocal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalUSD!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  tasaCambio!: number;

  @Column({ type: 'varchar', length: 20 })
  formaPago!: FormaPago;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoRecibidoLocal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  montoRecibidoUSD!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cambioLocal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  cambioUSD!: number;

  @Column({ type: 'text', nullable: true })
  notas!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}