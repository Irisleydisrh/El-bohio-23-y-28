import { Order, OrderStatus, OrderType } from '../config/entities/Order.js';
import { OrderItem } from '../config/entities/OrderItem.js';
import { OrderRepository } from './repositories/OrderRepository.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Order Service - Application Layer con TypeORM
 */
export class OrderService {
  private orderRepo: OrderRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderRepo.findAll();
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepo.findById(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.orderRepo.findByOrderNumber(orderNumber);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return this.orderRepo.findByStatus(status as OrderStatus);
  }

  async createOrder(data: {
    customerName: string;
    customerPhone: string;
    orderType?: OrderType;
    deliveryAddress?: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }): Promise<Order> {
    // Validar datos
    if (!data.customerName?.trim()) throw new Error('Customer name is required');
    if (!data.customerPhone?.trim()) throw new Error('Customer phone is required');
    if (!data.items?.length) throw new Error('At least one item is required');
    if (data.orderType === OrderType.DELIVERY && !data.deliveryAddress?.trim()) {
      throw new Error('Delivery address is required for delivery orders');
    }

    // Crear orden
    const order = new Order();
    order.orderNumber = this.generateOrderNumber();
    order.customerName = data.customerName;
    order.customerPhone = data.customerPhone;
    order.orderType = data.orderType || OrderType.PICKUP;
    order.deliveryAddress = data.deliveryAddress;
    order.status = OrderStatus.PENDING;
    order.total = 0;

    // Calcular total y crear items
    let total = 0;
    const orderItems: OrderItem[] = [];
    
    for (const item of data.items) {
      const orderItem = new OrderItem();
      orderItem.menuItemId = item.menuItemId;
      orderItem.quantity = item.quantity;
      orderItem.unitPrice = item.unitPrice;
      orderItem.subtotal = item.quantity * item.unitPrice;
      total += orderItem.subtotal;
      orderItems.push(orderItem);
    }
    
    order.total = total;
    order.items = orderItems;

    return this.orderRepo.save(order);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const existing = await this.orderRepo.findById(id);
    if (!existing) throw new Error('Order not found');

    // Validar transición de estado
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!validTransitions[existing.status].includes(status)) {
      throw new Error(`Cannot transition from ${existing.status} to ${status}`);
    }

    return this.orderRepo.update(id, { status });
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, OrderStatus.CANCELLED);
  }

  async getPendingOrders(): Promise<Order[]> {
    return this.orderRepo.findByStatus(OrderStatus.PENDING);
  }

  async getActiveOrders(): Promise<Order[]> {
    const confirmed = await this.orderRepo.findByStatus(OrderStatus.CONFIRMED);
    const preparing = await this.orderRepo.findByStatus(OrderStatus.PREPARING);
    const ready = await this.orderRepo.findByStatus(OrderStatus.READY);
    return [...confirmed, ...preparing, ...ready];
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuidv4().slice(0, 4).toUpperCase();
    return `ORD-${timestamp}${random}`;
  }
}