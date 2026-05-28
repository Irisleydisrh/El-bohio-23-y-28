import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CajaEstado {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
}

@Entity('cajas')
export class Caja {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ 
    type: 'enum', 
    enum: CajaEstado, 
    default: CajaEstado.CERRADA 
  })
  estado!: CajaEstado;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cajeroId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cajeroNombre!: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  aperturaLocal!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  aperturaUSD!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalVentasLocal!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalVentasUSD!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cierreLocal!: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  cierreUSD!: number | null;

  @Column({ type: 'text', nullable: true })
  observacionesCierre!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'date', nullable: true })
  fechaApertura!: string | null;

  @Column({ type: 'date', nullable: true })
  fechaCierre!: string | null;
}