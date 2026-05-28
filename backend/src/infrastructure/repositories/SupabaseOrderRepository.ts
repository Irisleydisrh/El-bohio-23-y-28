import { Order, type OrderProps, type OrderStatus, type OrderType } from '../../domain/entities/order/Order.js';
import { OrderItem, type OrderItemProps } from '../../domain/entities/order/OrderItem.js';
import { type IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import supabase from '../supabase/client.js';

export class SupabaseOrderRepository implements IOrderRepository {
  async findAll(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    const orders: Order[] = await Promise.all(
      (data || []).map(async row => {
        const items = await this.findOrderItems(row.id);
        return this.mapRowToOrder(row, items);
      })
    );

    return orders;
  }

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    const items = await this.findOrderItems(id);
    return this.mapRowToOrder(data, items);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch order: ${error.message}`);
    }

    const items = await this.findOrderItems(data.id);
    return this.mapRowToOrder(data, items);
  }

  async findByStatus(status: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    const orders: Order[] = await Promise.all(
      (data || []).map(async row => {
        const items = await this.findOrderItems(row.id);
        return this.mapRowToOrder(row, items);
      })
    );

    return orders;
  }

  async save(order: Order): Promise<Order> {
    const plain = order.toPlain();
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: plain.id,
        order_number: plain.orderNumber,
        customer_name: plain.customerName,
        customer_phone: plain.customerPhone,
        order_type: plain.orderType,
        delivery_address: plain.deliveryAddress,
        total: plain.total,
        status: plain.status,
      })
      .select()
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    for (const item of plain.items) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          id: item.id,
          order_id: plain.id,
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
        });

      if (itemError) throw new Error(`Failed to create order item: ${itemError.message}`);
    }

    return order;
  }

  async update(order: Order): Promise<Order> {
    const plain = order.toPlain();

    const { data, error } = await supabase
      .from('orders')
      .update({
        status: plain.status,
        total: plain.total,
      })
      .eq('id', plain.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update order: ${error.message}`);

    return order;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete order: ${error.message}`);
  }

  private async findOrderItems(orderId: string): Promise<OrderItemProps[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) throw new Error(`Failed to fetch order items: ${error.message}`);

    return (data || []).map(row => ({
      id: row.id,
      orderId: row.order_id,
      menuItemId: row.menu_item_id,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      subtotal: row.subtotal,
      createdAt: new Date(row.created_at),
    }));
  }

  private mapRowToOrder(row: any, items: OrderItemProps[]): Order {
    return new Order({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      orderType: row.order_type as OrderType,
      deliveryAddress: row.delivery_address,
      total: row.total,
      status: row.status as OrderStatus,
      items,
      createdAt: new Date(row.created_at),
    });
  }
}