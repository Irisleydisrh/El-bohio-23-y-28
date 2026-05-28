import { Entity } from '../base/Entity.js';
import { v4 as uuidv4 } from 'uuid';
import { OrderItem, OrderItemProps } from './OrderItem.js';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
export type OrderType = 'pickup' | 'delivery';

export interface OrderProps {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string;
  total: number;
  status: OrderStatus;
  items: OrderItemProps[];
  createdAt: Date;
}

export interface CreateOrderProps {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  deliveryAddress?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export class Order extends Entity<string> {
  private _orderNumber: string;
  private readonly _customerName: string;
  private readonly _customerPhone: string;
  private readonly _orderType: OrderType;
  private readonly _deliveryAddress?: string;
  private _total: number;
  private _status: OrderStatus;
  private readonly _items: OrderItem[];
  private readonly _createdAt: Date;

  constructor(props: OrderProps) {
    super(props.id);
    this._orderNumber = props.orderNumber;
    this._customerName = props.customerName;
    this._customerPhone = props.customerPhone;
    this._orderType = props.orderType;
    this._deliveryAddress = props.deliveryAddress;
    this._total = props.total;
    this._status = props.status;
    this._items = props.items.map(item => new OrderItem(item));
    this._createdAt = props.createdAt;
  }

  get orderNumber(): string { return this._orderNumber; }
  get customerName(): string { return this._customerName; }
  get customerPhone(): string { return this._customerPhone; }
  get orderType(): OrderType { return this._orderType; }
  get deliveryAddress(): string | undefined { return this._deliveryAddress; }
  get total(): number { return this._total; }
  get status(): OrderStatus { return this._status; }
  get items(): OrderItem[] { return [...this._items]; }
  get createdAt(): Date { return this._createdAt; }

  updateStatus(newStatus: OrderStatus): void {
    this._status = newStatus;
  }

  toPlain(): OrderProps {
    return {
      id: this._id,
      orderNumber: this._orderNumber,
      customerName: this._customerName,
      customerPhone: this._customerPhone,
      orderType: this._orderType,
      deliveryAddress: this._deliveryAddress,
      total: this._total,
      status: this._status,
      items: this._items.map(item => item.toPlain()),
      createdAt: this._createdAt,
    };
  }

  static create(props: CreateOrderProps): Order {
    const id = uuidv4();
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const total = props.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    
    const items = props.items.map(item => OrderItem.create({
      menuItemId: item.menuItemId,
      orderId: id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
    }));

    return new Order({
      id,
      orderNumber,
      customerName: props.customerName,
      customerPhone: props.customerPhone,
      orderType: props.orderType,
      deliveryAddress: props.deliveryAddress,
      total,
      status: 'pending',
      items: items.map(i => i.toPlain()),
      createdAt: new Date(),
    });
  }
}