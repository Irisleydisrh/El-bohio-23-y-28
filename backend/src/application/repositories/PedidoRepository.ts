import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { Pedido, PedidoEstado } from '../../config/entities/Pedido.js';
import { PedidoItem } from '../../config/entities/PedidoItem.js';
import { Producto } from '../../config/entities/Producto.js';

/**
 * Pedido Repository - TypeORM Implementation
 */
export class PedidoRepository {
  private repo: Repository<Pedido>;
  private itemRepo: Repository<PedidoItem>;

  constructor() {
    this.repo = AppDataSource.getRepository(Pedido);
    this.itemRepo = AppDataSource.getRepository(PedidoItem);
  }

  async findAll(): Promise<Pedido[]> {
    return this.repo.find({ 
      relations: ['mesa', 'mesera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<Pedido | null> {
    return this.repo.findOne({ 
      where: { id },
      relations: ['mesa', 'mesera']
    });
  }

  async findByMesa(mesaId: string): Promise<Pedido[]> {
    return this.repo.find({ 
      where: { mesaId },
      relations: ['mesa', 'mesera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findActivoByMesa(mesaId: string): Promise<Pedido | null> {
    return this.repo.findOne({ 
      where: { 
        mesaId,
        estado: PedidoEstado.ACTIVO 
      },
      relations: ['mesa', 'mesera']
    });
  }

  async findByMesera(meseraId: string): Promise<Pedido[]> {
    return this.repo.find({ 
      where: { meseraId },
      relations: ['mesa', 'mesera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByEstado(estado: PedidoEstado): Promise<Pedido[]> {
    return this.repo.find({ 
      where: { estado },
      relations: ['mesa', 'mesera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findAllActivos(): Promise<Pedido[]> {
    return this.repo.find({ 
      where: { estado: PedidoEstado.ACTIVO },
      relations: ['mesa', 'mesera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findAllPorCobrar(): Promise<Pedido[]> {
    return this.repo.find({ 
      where: { estado: PedidoEstado.POR_COBRAR },
      relations: ['mesa', 'mesera'],
      order: { createdAt: 'DESC' }
    });
  }

  async save(pedido: Pedido): Promise<Pedido> {
    return this.repo.save(pedido);
  }

  async update(id: string, data: Partial<Pedido>): Promise<Pedido> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Pedido>;
  }

  async updateEstado(id: string, estado: PedidoEstado): Promise<Pedido> {
    await this.repo.update(id, { estado });
    return this.findById(id) as Promise<Pedido>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // === Pedido Items ===

  async findItemsByPedido(pedidoId: string): Promise<PedidoItem[]> {
    return this.itemRepo.find({ 
      where: { pedidoId },
      relations: ['producto'],
      order: { createdAt: 'ASC' }
    });
  }

  async findItemById(id: string): Promise<PedidoItem | null> {
    return this.itemRepo.findOne({ 
      where: { id },
      relations: ['producto']
    });
  }

  async addItem(item: PedidoItem): Promise<PedidoItem> {
    return this.itemRepo.save(item);
  }

  async addItems(items: PedidoItem[]): Promise<PedidoItem[]> {
    return this.itemRepo.save(items);
  }

  async updateItem(id: string, cantidad: number): Promise<PedidoItem> {
    await this.itemRepo.update(id, { cantidad });
    return this.findItemById(id) as Promise<PedidoItem>;
  }

  async removeItem(id: string): Promise<void> {
    await this.itemRepo.delete(id);
  }

  async clearItems(pedidoId: string): Promise<void> {
    await this.itemRepo.delete({ pedidoId });
  }
}

/**
 * Helper function to get producto precio
 */
export async function getProductoPrecio(productoId: string): Promise<number> {
  const producto = await AppDataSource.getRepository(Producto).findOne({ 
    where: { id: productoId } 
  });
  return producto?.precio ?? 0;
}