import { Pedido, PedidoEstado } from '../config/entities/Pedido.js';
import { PedidoItem } from '../config/entities/PedidoItem.js';
import { Mesa, MesaEstado } from '../config/entities/Mesa.js';
import { Producto } from '../config/entities/Producto.js';
import { AppDataSource } from '../config/dataSource.js';
import { MesaRepository } from './repositories/MesaRepository.js';
import { PedidoRepository, getProductoPrecio } from './repositories/PedidoRepository.js';

/**
 * Pedido Service - Application Layer
 * Manejo de pedidos por mesa
 */
export class PedidoService {
  private repo: PedidoRepository;
  private mesaRepo: MesaRepository;

  constructor() {
    this.repo = new PedidoRepository();
    this.mesaRepo = new MesaRepository();
  }

  /**
   * Obtiene todos los pedidos
   */
  async getAll(): Promise<Pedido[]> {
    return this.repo.findAll();
  }

  /**
   * Obtiene un pedido por ID
   */
  async getById(id: string): Promise<Pedido | null> {
    const pedido = await this.repo.findById(id);
    if (pedido) {
      const items = await this.repo.findItemsByPedido(id);
      (pedido as any).items = items;
    }
    return pedido;
  }

  /**
   * Obtiene pedidos por mesa
   */
  async getByMesa(mesaId: string): Promise<Pedido[]> {
    return this.repo.findByMesa(mesaId);
  }

  /**
   * Obtiene el pedido activo de una mesa
   */
  async getActivoByMesa(mesaId: string): Promise<Pedido | null> {
    return this.repo.findActivoByMesa(mesaId);
  }

  /**
   * Obtiene pedidos por mesera
   */
  async getByMesera(meseraId: string): Promise<Pedido[]> {
    return this.repo.findByMesera(meseraId);
  }

  /**
   * Obtiene pedidos por estado
   */
  async getByEstado(estado: PedidoEstado): Promise<Pedido[]> {
    return this.repo.findByEstado(estado);
  }

  /**
   * Obtiene todos los pedidos activos
   */
  async getAllActivos(): Promise<Pedido[]> {
    const pedidos = await this.repo.findAllActivos();
    // Attach items to each pedido
    for (const pedido of pedidos) {
      const items = await this.repo.findItemsByPedido(pedido.id);
      (pedido as any).items = items;
    }
    return pedidos;
  }

  /**
   * Obtiene todos los pedidos por cobrar
   */
  async getAllPorCobrar(): Promise<Pedido[]> {
    const pedidos = await this.repo.findAllPorCobrar();
    // Attach items to each pedido
    for (const pedido of pedidos) {
      const items = await this.repo.findItemsByPedido(pedido.id);
      (pedido as any).items = items;
    }
    return pedidos;
  }

  /**
   * Crea un nuevo pedido para una mesa
   */
  async create(data: {
    mesaId: string;
    meseraId: string;
    items: Array<{ productoId: string; cantidad: number }>;
    descuento?: number;
  }): Promise<Pedido> {
    // Verificar que la mesa existe
    const mesa = await this.mesaRepo.findById(data.mesaId);
    if (!mesa) {
      throw new Error('Mesa no encontrada');
    }

    // Verificar que no haya un pedido activo
    const existente = await this.repo.findActivoByMesa(data.mesaId);
    if (existente) {
      throw new Error('Ya existe un pedido activo en esta mesa');
    }

    // Crear el pedido
    const pedido = new Pedido();
    Object.assign(pedido, {
      mesaId: data.mesaId,
      meseraId: data.meseraId,
      estado: PedidoEstado.ACTIVO,
      descuento: data.descuento ?? 0,
      subtotal: 0,
      total: 0
    });

    const savedPedido = await this.repo.save(pedido);

    // Agregar los items
    await this.addItems(savedPedido.id, data.items);

    // Actualizar estado de la mesa
    await this.mesaRepo.updateEstado(data.mesaId, MesaEstado.OCUPADA);

    // Retornar el pedido con items calculados
    return this.getById(savedPedido.id) as Promise<Pedido>;
  }

  /**
   * Agrega items a un pedido existente
   */
  async addItems(pedidoId: string, items: Array<{ productoId: string; cantidad: number }>): Promise<PedidoItem[]> {
    const pedido = await this.repo.findById(pedidoId);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    if (pedido.estado !== PedidoEstado.ACTIVO) {
      throw new Error('No se pueden agregar items a un pedido que no está activo');
    }

    const productoRepo = AppDataSource.getRepository(Producto);
    const pedidoItems: PedidoItem[] = [];

    for (const item of items) {
      // Verificar que el producto existe y está activo
      const producto = await productoRepo.findOne({ where: { id: item.productoId, activo: true } });
      if (!producto) {
        throw new Error(`Producto ${item.productoId} no encontrado o inactivo`);
      }

      const pedidoItem = new PedidoItem();
      Object.assign(pedidoItem, {
        pedidoId,
        productoId: item.productoId,
        productoNombre: producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * item.cantidad
      });

      pedidoItems.push(pedidoItem);
    }

    const savedItems = await this.repo.addItems(pedidoItems);

    // Recalcular totales
    await this.recalcularTotales(pedidoId);

    return savedItems;
  }

  /**
   * Actualiza la cantidad de un item
   */
  async updateItemCantidad(pedidoItemId: string, cantidad: number): Promise<PedidoItem> {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    const item = await this.repo.findItemById(pedidoItemId);
    if (!item) {
      throw new Error('Item no encontrado');
    }

    const pedido = await this.repo.findById(item.pedidoId);
    if (!pedido || pedido.estado !== PedidoEstado.ACTIVO) {
      throw new Error('No se puede modificar un pedido que no está activo');
    }

    // Actualizar cantidad y subtotal
    await this.repo.updateItem(pedidoItemId, cantidad);
    
    // Recalcular totales
    await this.recalcularTotales(pedido.id);

    return this.repo.findItemById(pedidoItemId) as Promise<PedidoItem>;
  }

  /**
   * Elimina un item del pedido
   */
  async removeItem(pedidoItemId: string): Promise<void> {
    const item = await this.repo.findItemById(pedidoItemId);
    if (!item) {
      throw new Error('Item no encontrado');
    }

    const pedido = await this.repo.findById(item.pedidoId);
    if (!pedido || pedido.estado !== PedidoEstado.ACTIVO) {
      throw new Error('No se puede modificar un pedido que no está activo');
    }

    await this.repo.removeItem(pedidoItemId);

    // Recalcular totales
    await this.recalcularTotales(pedido.id);
  }

  /**
   * Cambia el estado del pedido
   */
  async updateEstado(pedidoId: string, estado: PedidoEstado): Promise<Pedido> {
    const pedido = await this.repo.findById(pedidoId);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    const updatedPedido = await this.repo.updateEstado(pedidoId, estado);

    // Actualizar estado de la mesa según corresponda
    if (estado === PedidoEstado.POR_COBRAR) {
      await this.mesaRepo.updateEstado(pedido.mesaId, MesaEstado.POR_COBRAR);
    } else if (estado === PedidoEstado.CERRADO) {
      await this.mesaRepo.updateEstado(pedido.mesaId, MesaEstado.LIBRE);
    } else if (estado === PedidoEstado.CANCELADO) {
      await this.mesaRepo.updateEstado(pedido.mesaId, MesaEstado.LIBRE);
    }

    return updatedPedido;
  }

  /**
   * Marca el pedido para cobrar
   */
  async marcarParaCobrar(pedidoId: string): Promise<Pedido> {
    return this.updateEstado(pedidoId, PedidoEstado.POR_COBRAR);
  }

  /**
   * Cancela un pedido
   */
  async cancelar(pedidoId: string): Promise<Pedido> {
    return this.updateEstado(pedidoId, PedidoEstado.CANCELADO);
  }

  /**
   * Cierra un pedido (después del pago)
   */
  async cerrar(pedidoId: string): Promise<Pedido> {
    return this.updateEstado(pedidoId, PedidoEstado.CERRADO);
  }

  /**
   * Aplica descuento al pedido
   */
  async aplicarDescuento(pedidoId: string, descuento: number): Promise<Pedido> {
    const pedido = await this.repo.findById(pedidoId);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    if (descuento < 0 || descuento > pedido.subtotal) {
      throw new Error('El descuento no puede ser mayor al subtotal');
    }

    await this.repo.update(pedidoId, { descuento });
    return this.recalcularTotales(pedidoId).then(() => this.getById(pedidoId)) as Promise<Pedido>;
  }

  /**
   * Recalcula los totales del pedido
   */
  private async recalcularTotales(pedidoId: string): Promise<void> {
    const items = await this.repo.findItemsByPedido(pedidoId);
    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
    
    const pedido = await this.repo.findById(pedidoId);
    if (!pedido) return;

    const descuento = Number(pedido.descuento) || 0;
    const total = subtotal - descuento;

    await this.repo.update(pedidoId, { subtotal, total });
  }

  /**
   * Obtiene los items de un pedido con detalles completos
   */
  async getItems(pedidoId: string): Promise<PedidoItem[]> {
    return this.repo.findItemsByPedido(pedidoId);
  }
}