import { Order, OrderProps } from '../entities/order/Order.js';

/**
 * Order Repository Interface
 */
export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByStatus(status: string): Promise<Order[]>;
  save(order: Order): Promise<Order>;
  update(order: Order): Promise<Order>;
  delete(id: string): Promise<void>;
}