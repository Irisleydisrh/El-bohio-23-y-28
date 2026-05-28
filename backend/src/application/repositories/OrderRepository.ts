import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { Order, OrderStatus } from '../../config/entities/Order.js';
import { OrderItem } from '../../config/entities/OrderItem.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Order Repository - TypeORM Implementation
 */
export class OrderRepository {
  private repo: Repository<Order>;
  private itemRepo: Repository<OrderItem>;

  constructor() {
    this.repo = AppDataSource.getRepository(Order);
    this.itemRepo = AppDataSource.getRepository(OrderItem);
  }

  async findAll(): Promise<Order[]> {
    return this.repo.find({ 
      relations: ['items'],
      order: { createdAt: 'DESC' } 
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.repo.findOne({ 
      where: { id },
      relations: ['items']
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.repo.findOne({ 
      where: { orderNumber },
      relations: ['items']
    });
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    return this.repo.find({ 
      where: { status },
      relations: ['items'],
      order: { createdAt: 'DESC' } 
    });
  }

  async save(order: Order): Promise<Order> {
    return this.repo.save(order);
  }

  async update(id: string, data: Partial<Order>): Promise<Order> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Order>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuidv4().slice(0, 4).toUpperCase();
    return `ORD-${timestamp}${random}`;
  }
}

export class OrderItemRepository {
  private repo: Repository<OrderItem>;

  constructor() {
    this.repo = AppDataSource.getRepository(OrderItem);
  }

  async findByOrderId(orderId: string): Promise<OrderItem[]> {
    return this.repo.find({ where: { orderId } });
  }
}