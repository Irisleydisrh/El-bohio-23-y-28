/**
 * DTO para crear una transacción
 */
export interface CreateTransaccionDto {
  mesaId: string;
  pedidoId: string;
  cajeraId: string;
  cajeraNombre: string;
  subtotal: number;
  descuento: number;
  tasaCambio: number;
  formaPago: 'efectivo_local' | 'efectivo_usd' | 'mixto' | 'tarjeta';
  montoRecibidoLocal?: number;
  montoRecibidoUSD?: number;
  notas?: string;
}

/**
 * DTO para crear detalle de transacción
 */
export interface CreateTransaccionDetalleDto {
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/**
 * DTO para cierre de mesa (genera transacción)
 */
export interface CerrarMesaDto {
  mesaId: string;
  pedidoId: string;
  cajeraId: string;
  cajeraNombre: string;
  descuento: number;
  formaPago: 'efectivo_local' | 'efectivo_usd' | 'mixto' | 'tarjeta';
  montoRecibidoLocal?: number;
  montoRecibidoUSD?: number;
  notas?: string;
}

/**
 * Response de ticket
 */
export interface TicketResponse {
  numeroTransaccion: string;
  mesaNumero: number;
  cajeraNombre: string;
  fecha: Date;
  items: Array<{
    nombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  subtotal: number;
  descuento: number;
  totalLocal: number;
  totalUSD: number;
  tasaCambio: number;
  formaPago: string;
  montoRecibidoLocal: number;
  montoRecibidoUSD: number;
  cambioLocal: number;
  cambioUSD: number;
}