/**
 * DTO para crear un ítem en un pedido
 */
export interface CreatePedidoItemDto {
  productoId: string;
  cantidad: number;
}

/**
 * DTO para crear un nuevo pedido
 */
export interface CreatePedidoDto {
  mesaId: string;
  meseraId: string;
  items: CreatePedidoItemDto[];
  descuento?: number;
}

/**
 * DTO para actualizar estado de un pedido
 */
export interface UpdatePedidoEstadoDto {
  estado: 'activo' | 'por_cobrar' | 'cerrado' | 'cancelado';
}

/**
 * DTO para agregar items a un pedido existente
 */
export interface AddPedidoItemsDto {
  items: CreatePedidoItemDto[];
}

/**
 * DTO para actualizar un item del pedido
 */
export interface UpdatePedidoItemDto {
  cantidad: number;
}