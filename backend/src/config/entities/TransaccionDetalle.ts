import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaccion } from './Transaccion.js';

/**
 * TransaccionDetalle Entity - TypeORM
 * Itemized breakdown of a transaction
 */
@Entity('transacciones_detalle')
export class TransaccionDetalle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  transaccionId!: string;

  @ManyToOne(() => Transaccion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaccionId' })
  transaccion!: Transaccion;

  @Column({ type: 'varchar', length: 200 })
  productoNombre!: string;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precioUnitario!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;
}