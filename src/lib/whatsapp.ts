import { CartItem } from '@/store/cartStore';

const WHATSAPP_NUMBER = ''; // Se configurará después

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BOH-${timestamp}-${random}`;
}

export function buildOrderMessage({
  orderId,
  items,
  total,
  orderType,
  customerName,
  customerPhone,
  deliveryAddress,
}: {
  orderId: string;
  items: CartItem[];
  total: number;
  orderType: 'delivery' | 'pickup';
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
}): string {
  const itemsList = items
    .map((i) => `  • ${i.quantity}x ${i.name} — $${(i.price * i.quantity).toFixed(2)} CUP`)
    .join('\n');

  const typeLabel = orderType === 'delivery' ? '🛵 Delivery a domicilio' : '🏪 Recoger en local';

  let msg = `🍔 *NUEVO PEDIDO — EL BOHÍO 23 y 28*\n\n`;
  msg += `📋 *ID de Orden:* ${orderId}\n`;
  msg += `👤 *Cliente:* ${customerName}\n`;
  msg += `📱 *Teléfono:* ${customerPhone}\n`;
  msg += `📦 *Tipo:* ${typeLabel}\n`;
  if (orderType === 'delivery' && deliveryAddress) {
    msg += `📍 *Dirección:* ${deliveryAddress}\n`;
  }
  msg += `\n🛒 *Productos:*\n${itemsList}\n`;
  msg += `\n💰 *TOTAL: $${total.toFixed(2)} CUP*`;

  return msg;
}

export function buildReservationMessage({
  name,
  phone,
  date,
  time,
  guests,
}: {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
}): string {
  let msg = `🪑 *RESERVACIÓN — EL BOHÍO 23 y 28*\n\n`;
  msg += `👤 *Nombre:* ${name}\n`;
  msg += `📱 *Teléfono:* ${phone}\n`;
  msg += `📅 *Fecha:* ${date}\n`;
  msg += `🕐 *Hora:* ${time}\n`;
  msg += `👥 *Personas:* ${guests}\n`;
  return msg;
}

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  const url = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}
