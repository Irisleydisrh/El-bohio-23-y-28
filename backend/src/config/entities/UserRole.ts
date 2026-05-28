import 'reflect-metadata';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User.js';

/**
 * UserRole Entity - TypeORM
 * Roles: cajera (admin), mesera (waiter)
 */
export enum AppRole {
  CAJERA = 'cajera',
  MESERA = 'mesera',
}

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 20, default: 'mesera' })
  role!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  // Relaciones
  @OneToOne(() => User, (user) => user.role)
  @JoinColumn({ name: 'userId' })
  user!: User;
}