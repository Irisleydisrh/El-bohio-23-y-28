import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Mesa } from './Mesa.js';
import { User } from './User.js';

export enum PedidoEstado {
  ACTIVO = 'activo',
  POR_COBRAR = 'por_cobrar',
  CERRADO = 'cerrado',
  CANCELADO = 'cancelado',
}

/**
 * Pedido Entity - TypeORM
 * Represents an order for a table
 */
@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  mesaId!: string;

  @ManyToOne(() => Mesa)
  @JoinColumn({ name: 'mesaId' })
  mesa!: Mesa;

  @Column({ type: 'uuid' })
  meseraId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'meseraId' })
  mesera!: User;

  @Column({ 
    type: 'enum', 
    enum: PedidoEstado, 
    default: PedidoEstado.ACTIVO 
  })
  estado!: PedidoEstado;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  descuento!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}