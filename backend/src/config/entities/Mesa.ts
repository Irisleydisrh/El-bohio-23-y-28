import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MesaEstado {
  LIBRE = 'libre',
  OCUPADA = 'ocupada',
  POR_COBRAR = 'por_cobrar',
}

/**
 * Mesa Entity - TypeORM
 * Represents a physical table in the restaurant
 */
@Entity('mesas')
export class Mesa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'int', unique: true })
  numero!: number;

  @Column({ 
    type: 'enum', 
    enum: MesaEstado, 
    default: MesaEstado.LIBRE 
  })
  estado!: MesaEstado;

  @Column({ type: 'int', default: 4 })
  capacidad!: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nombre!: string | null;

  @Column({ type: 'int', default: 0 })
  posicionX!: number;

  @Column({ type: 'int', default: 0 })
  posicionY!: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}