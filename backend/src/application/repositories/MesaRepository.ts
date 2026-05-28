import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { Mesa, MesaEstado } from '../../config/entities/Mesa.js';

/**
 * Mesa Repository - TypeORM Implementation
 */
export class MesaRepository {
  private repo: Repository<Mesa>;

  constructor() {
    this.repo = AppDataSource.getRepository(Mesa);
  }

  async findAll(): Promise<Mesa[]> {
    return this.repo.find({ 
      order: { numero: 'ASC' } 
    });
  }

  async findById(id: string): Promise<Mesa | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByNumero(numero: number): Promise<Mesa | null> {
    return this.repo.findOne({ where: { numero } });
  }

  async findByEstado(estado: MesaEstado): Promise<Mesa[]> {
    return this.repo.find({ 
      where: { estado },
      order: { numero: 'ASC' }
    });
  }

  async findWithPedidosActivos(): Promise<Mesa[]> {
    const mesas = await this.repo.find({
      order: { numero: 'ASC' }
    });
    // Filter to only those with active orders - this will be handled at service level
    return mesas;
  }

  async save(mesa: Mesa): Promise<Mesa> {
    return this.repo.save(mesa);
  }

  async update(id: string, data: Partial<Mesa>): Promise<Mesa> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Mesa>;
  }

  async updateEstado(id: string, estado: MesaEstado): Promise<Mesa> {
    await this.repo.update(id, { estado });
    return this.findById(id) as Promise<Mesa>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}