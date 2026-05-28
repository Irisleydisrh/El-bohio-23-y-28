import { z } from 'zod';

/**
 * Schema para crear/editar un producto
 */
export const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre muy largo'),
  descripcion: z.string().max(500, 'Descripción muy larga').optional(),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  categoriaId: z.string().uuid('ID de categoría inválido'),
  imagenUrl: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  activo: z.boolean().optional().default(true),
  destacado: z.boolean().optional().default(false),
});

/**
 * Schema para crear/editar una categoría
 */
export const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(50, 'Nombre muy largo'),
  descripcion: z.string().max(200, 'Descripción muy larga').optional(),
  icono: z.string().max(10, 'Icono muy largo').optional(),
  orden: z.number().int().positive().optional(),
  activa: z.boolean().optional().default(true),
});

/**
 * Schema para crear un pedido
 */
export const crearPedidoSchema = z.object({
  mesaId: z.string().uuid('ID de mesa inválido'),
  meseraId: z.string().uuid('ID de mesera inválido'),
  items: z.array(z.object({
    productoId: z.string().uuid('ID de producto inválido'),
    cantidad: z.number().int().positive('La cantidad debe ser mayor a 0'),
  })).min(1, 'Se requiere al menos un producto'),
  descuento: z.number().min(0).max(100).optional().default(0),
});

/**
 * Schema para procesar un pago
 */
export const pagoSchema = z.object({
  pedidoId: z.string().uuid('ID de pedido inválido'),
  mesaId: z.string().uuid('ID de mesa inválido'),
  formaPago: z.enum(['efectivo_local', 'efectivo_usd', 'mixto', 'tarjeta']),
  montoRecibidoLocal: z.number().min(0).optional(),
  montoRecibidoUSD: z.number().min(0).optional(),
  descuento: z.number().min(0).max(100).optional().default(0),
  notas: z.string().max(500).optional(),
}).refine((data) => {
  // Para efectivo, debe haber un monto
  if (data.formaPago === 'efectivo_local' && (!data.montoRecibidoLocal || data.montoRecibidoLocal <= 0)) {
    return false;
  }
  if (data.formaPago === 'efectivo_usd' && (!data.montoRecibidoUSD || data.montoRecibidoUSD <= 0)) {
    return false;
  }
  return true;
}, {
  message: 'Para efectivo se requiere monto recibido',
  path: ['montoRecibidoLocal'],
});

/**
 * Schema para abrir/cerrar caja
 */
export const cajaSchema = z.object({
  cajeroId: z.string().uuid('ID de cajero inválido'),
  cajeroNombre: z.string().min(1, 'El nombre es requerido'),
  aperturaLocal: z.number().min(0).optional().default(0),
  aperturaUSD: z.number().min(0).optional().default(0),
});

export const cerrarCajaSchema = z.object({
  observaciones: z.string().max(500).optional(),
});

/**
 * Schema para tasa de cambio
 */
export const tasaCambioSchema = z.object({
  tasa: z.number().positive('La tasa debe ser mayor a 0'),
  moneda: z.string().length(3, 'Código de moneda debe ser de 3 letras').optional().default('USD'),
  monedaBase: z.string().length(3).optional().default('CUP'),
});

/**
 * Schema para login
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Types inferidos
export type ProductoInput = z.infer<typeof productoSchema>;
export type CategoriaInput = z.infer<typeof categoriaSchema>;
export type CrearPedidoInput = z.infer<typeof crearPedidoSchema>;
export type PagoInput = z.infer<typeof pagoSchema>;
export type CajaInput = z.infer<typeof cajaSchema>;
export type CerrarCajaInput = z.infer<typeof cerrarCajaSchema>;
export type TasaCambioInput = z.infer<typeof tasaCambioSchema>;
export type LoginInput = z.infer<typeof loginSchema>;