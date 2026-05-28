import { Entity } from '../base/Entity.js';
import { v4 as uuidv4 } from 'uuid';

export interface OrderItemProps {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: Date;
}

export class OrderItem extends Entity<string> {
  private readonly _orderId: string;
  private readonly _menuItemId: string;
  private readonly _quantity: number;
  private readonly _unitPrice: number;
  private readonly _subtotal: number;
  private readonly _createdAt: Date;

  constructor(props: OrderItemProps) {
    super(props.id);
    this._orderId = props.orderId;
    this._menuItemId = props.menuItemId;
    this._quantity = props.quantity;
    this._unitPrice = props.unitPrice;
    this._subtotal = props.subtotal;
    this._createdAt = props.createdAt;
  }

  get orderId(): string { return this._orderId; }
  get menuItemId(): string { return this._menuItemId; }
  get quantity(): number { return this._quantity; }
  get unitPrice(): number { return this._unitPrice; }
  get subtotal(): number { return this._subtotal; }
  get createdAt(): Date { return this._createdAt; }

  toPlain(): OrderItemProps {
    return {
      id: this._id,
      orderId: this._orderId,
      menuItemId: this._menuItemId,
      quantity: this._quantity,
      unitPrice: this._unitPrice,
      subtotal: this._subtotal,
      createdAt: this._createdAt,
    };
  }

  static create(props: Omit<OrderItemProps, 'id' | 'createdAt'>): OrderItem {
    return new OrderItem({
      ...props,
      id: uuidv4(),
      createdAt: new Date(),
    });
  }
}