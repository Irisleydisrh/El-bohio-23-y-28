import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './Pedido.js';
import { Producto } from './Producto.js'; // We'll rename MenuItem -> Producto

/**
 * PedidoItem Entity - TypeORM
 * Items in an order with SNAPSHOT of price (not reference!)
 */
@Entity('detalle_pedido')
export class PedidoItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  pedidoId!: string;

  @ManyToOne(() => Pedido, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedidoId' })
  pedido!: Pedido;

  @Column({ type: 'uuid' })
  productoId!: string;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto!: Producto;

  @Column({ type: 'varchar', length: 200 })
  productoNombre!: string;

  @Column({ type: 'int' })
  cantidad!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  precioUnitario!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}