import { Transaccion, FormaPago } from '../config/entities/Transaccion.js';
import { TransaccionDetalle } from '../config/entities/TransaccionDetalle.js';
import { Pedido, PedidoEstado } from '../config/entities/Pedido.js';
import { PedidoItem } from '../config/entities/PedidoItem.js';
import { Mesa, MesaEstado } from '../config/entities/Mesa.js';
import { ExchangeRate } from '../config/entities/ExchangeRate.js';
import { TransaccionRepository } from './repositories/TransaccionRepository.js';
import { PedidoRepository } from './repositories/PedidoRepository.js';
import { ExchangeRateRepository } from './repositories/ExchangeRateRepository.js';
import { MesaRepository } from './repositories/MesaRepository.js';

export interface TicketData {
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
  notas?: string;
}

/**
 * Transaccion Service - Application Layer
 * Manejo de transacciones y cierre de mesas
 */
export class TransaccionService {
  private repo: TransaccionRepository;
  private pedidoRepo: PedidoRepository;
  private tasaRepo: ExchangeRateRepository;
  private mesaRepo: MesaRepository;

  constructor() {
    this.repo = new TransaccionRepository();
    this.pedidoRepo = new PedidoRepository();
    this.tasaRepo = new ExchangeRateRepository();
    this.mesaRepo = new MesaRepository();
  }

  /**
   * Obtiene todas las transacciones
   */
  async getAll(): Promise<Transaccion[]> {
    return this.repo.findAll();
  }

  /**
   * Obtiene una transacción por ID
   */
  async getById(id: string): Promise<Transaccion | null> {
    const transaccion = await this.repo.findById(id);
    if (transaccion) {
      const detalles = await this.repo.findDetallesByTransaccion(id);
      (transaccion as any).detalles = detalles;
    }
    return transaccion;
  }

  /**
   * Obtiene una transacción por número
   */
  async getByNumero(numero: string): Promise<Transaccion | null> {
    return this.repo.findByNumero(numero);
  }

  /**
   * Obtiene transacciones por mesa
   */
  async getByMesa(mesaId: string): Promise<Transaccion[]> {
    return this.repo.findByMesa(mesaId);
  }

  /**
   * Obtiene transacciones por cajera
   */
  async getByCajera(cajeraId: string): Promise<Transaccion[]> {
    return this.repo.findByCajera(cajeraId);
  }

  /**
   * Obtiene transacciones por rango de fechas
   */
  async getByDateRange(start: Date, end: Date): Promise<Transaccion[]> {
    return this.repo.findByDateRange(start, end);
  }

  /**
   * Cierra una mesa: crea la transacción y actualiza estados
   */
  async cerrarMesa(data: {
    mesaId: string;
    pedidoId: string;
    cajeraId: string;
    cajeraNombre: string;
    descuento: number;
    formaPago: 'efectivo_local' | 'efectivo_usd' | 'mixto' | 'tarjeta';
    montoRecibidoLocal?: number;
    montoRecibidoUSD?: number;
    notas?: string;
  }): Promise<{ transaccion: Transaccion; ticket: TicketData }> {
    // 1. Verificar que la mesa existe
    const mesa = await this.mesaRepo.findById(data.mesaId);
    if (!mesa) {
      throw new Error('Mesa no encontrada');
    }

    // 2. Verificar que el pedido existe y está en estado correcto
    const pedido = await this.pedidoRepo.findById(data.pedidoId);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    if (pedido.estado !== PedidoEstado.POR_COBRAR && pedido.estado !== PedidoEstado.ACTIVO) {
      throw new Error('El pedido no está en estado para cobrar');
    }

    // 3. Obtener los items del pedido
    const items = await this.pedidoRepo.findItemsByPedido(data.pedidoId);
    if (items.length === 0) {
      throw new Error('El pedido no tiene items');
    }

    // 4. Obtener la tasa de cambio activa
    const tasa = await this.tasaRepo.findActive();
    if (!tasa) {
      throw new Error('No hay tasa de cambio configurada');
    }

    // 5. Calcular totales
    const subtotal = Number(pedido.subtotal);
    const descuento = data.descuento ?? Number(pedido.descuento) ?? 0;
    const totalLocal = subtotal - descuento;
    const totalUSD = Number(tasa.tasa) > 0 ? Number(totalLocal) / Number(tasa.tasa) : 0;

    // 6. Calcular cambio
    let cambioLocal = 0;
    let cambioUSD = 0;

    if (data.formaPago === 'efectivo_local' && data.montoRecibidoLocal) {
      cambioLocal = Number(data.montoRecibidoLocal) - totalLocal;
    } else if (data.formaPago === 'efectivo_usd' && data.montoRecibidoUSD) {
      cambioUSD = Number(data.montoRecibidoUSD) - totalUSD;
    } else if (data.formaPago === 'mixto') {
      if (data.montoRecibidoLocal) {
        cambioLocal = Number(data.montoRecibidoLocal) - (totalLocal * 0.7); // 70% en local假设
      }
      if (data.montoRecibidoUSD) {
        cambioUSD = Number(data.montoRecibidoUSD) - (totalUSD * 0.3); // 30% en USD假设
      }
    }

    // 7. Generar número de transacción
    const numeroTransaccion = await this.repo.generateNumero();

    // 8. Crear la transacción
    const transaccion = new Transaccion();
    Object.assign(transaccion, {
      numeroTransaccion,
      mesaId: data.mesaId,
      mesaNumero: mesa.numero,
      cajeraId: data.cajeraId,
      cajeraNombre: data.cajeraNombre,
      pedidoId: data.pedidoId,
      subtotal,
      descuento,
      totalLocal,
      totalUSD,
      tasaCambio: Number(tasa.tasa),
      formaPago: data.formaPago as FormaPago,
      montoRecibidoLocal: data.montoRecibidoLocal ?? 0,
      montoRecibidoUSD: data.montoRecibidoUSD ?? 0,
      cambioLocal: Math.max(0, cambioLocal),
      cambioUSD: Math.max(0, cambioUSD),
      notas: data.notas
    });

    const savedTransaccion = await this.repo.save(transaccion);

    // 9. Crear los detalles de la transacción
    const detalles = items.map(item => {
      const detalle = new TransaccionDetalle();
      Object.assign(detalle, {
        transaccionId: savedTransaccion.id,
        productoNombre: item.productoNombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.subtotal
      });
      return detalle;
    });

    await this.repo.addDetalles(detalles);

    // 10. Actualizar estado del pedido a cerrado
    await this.pedidoRepo.updateEstado(data.pedidoId, PedidoEstado.CERRADO);

    // 11. Liberar la mesa
    await this.mesaRepo.updateEstado(data.mesaId, MesaEstado.LIBRE);

    // 12. Generar datos del ticket
    const ticket: TicketData = {
      numeroTransaccion: savedTransaccion.numeroTransaccion,
      mesaNumero: mesa.numero,
      cajeraNombre: data.cajeraNombre,
      fecha: savedTransaccion.createdAt,
      items: items.map(item => ({
        nombre: item.productoNombre,
        cantidad: item.cantidad,
        precioUnitario: Number(item.precioUnitario),
        subtotal: Number(item.subtotal)
      })),
      subtotal,
      descuento,
      totalLocal,
      totalUSD,
      tasaCambio: Number(tasa.tasa),
      formaPago: this.getFormaPagoLabel(data.formaPago),
      montoRecibidoLocal: data.montoRecibidoLocal ?? 0,
      montoRecibidoUSD: data.montoRecibidoUSD ?? 0,
      cambioLocal: Math.max(0, cambioLocal),
      cambioUSD: Math.max(0, cambioUSD),
      notas: data.notas
    };

    return { transaccion: savedTransaccion, ticket };
  }

  /**
   * Obtiene el ticket de una transacción
   */
  async getTicket(transaccionId: string): Promise<TicketData | null> {
    const transaccion = await this.getById(transaccionId);
    if (!transaccion) {
      return null;
    }

    const detalles = await this.repo.findDetallesByTransaccion(transaccionId);

    return {
      numeroTransaccion: transaccion.numeroTransaccion,
      mesaNumero: transaccion.mesaNumero,
      cajeraNombre: transaccion.cajeraNombre,
      fecha: transaccion.createdAt,
      items: detalles.map(d => ({
        nombre: d.productoNombre,
        cantidad: d.cantidad,
        precioUnitario: Number(d.precioUnitario),
        subtotal: Number(d.subtotal)
      })),
      subtotal: Number(transaccion.subtotal),
      descuento: Number(transaccion.descuento),
      totalLocal: Number(transaccion.totalLocal),
      totalUSD: Number(transaccion.totalUSD),
      tasaCambio: Number(transaccion.tasaCambio),
      formaPago: this.getFormaPagoLabel(transaccion.formaPago),
      montoRecibidoLocal: Number(transaccion.montoRecibidoLocal),
      montoRecibidoUSD: Number(transaccion.montoRecibidoUSD),
      cambioLocal: Number(transaccion.cambioLocal),
      cambioUSD: Number(transaccion.cambioUSD),
      notas: transaccion.notas ?? undefined
    };
  }

  /**
   * Obtiene el ticket por número de transacción
   */
  async getTicketByNumero(numero: string): Promise<TicketData | null> {
    const transaccion = await this.repo.findByNumero(numero);
    if (!transaccion) {
      return null;
    }
    return this.getTicket(transaccion.id);
  }

  /**
   * Obtiene etiqueta legible de la forma de pago
   */
  private getFormaPagoLabel(formaPago: string | FormaPago): string {
    const labels: Record<string, string> = {
      efectivo_local: 'Efectivo (CUP)',
      efectivo_usd: 'Efectivo (USD)',
      mixto: 'Pago Mixto',
      tarjeta: 'Tarjeta'
    };
    return labels[formaPago] || formaPago;
  }
}