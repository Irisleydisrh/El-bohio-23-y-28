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
import { Categoria } from './Categoria.js';

/**
 * Producto Entity - TypeORM (renamed from MenuItem)
 * Products/Menu items - soft delete (inactive, not deleted)
 */
@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  nombre!: string;

  @Column({ type: 'text', nullable: true })
  descripcion!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'uuid' })
  categoriaId!: string;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'categoriaId' })
  categoria!: Categoria;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imagenUrl!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'boolean', default: false })
  destacado!: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}