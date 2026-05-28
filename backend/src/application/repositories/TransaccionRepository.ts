import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { Transaccion, FormaPago } from '../../config/entities/Transaccion.js';
import { TransaccionDetalle } from '../../config/entities/TransaccionDetalle.js';

/**
 * Transaccion Repository - TypeORM Implementation
 */
export class TransaccionRepository {
  private repo: Repository<Transaccion>;
  private detalleRepo: Repository<TransaccionDetalle>;

  constructor() {
    this.repo = AppDataSource.getRepository(Transaccion);
    this.detalleRepo = AppDataSource.getRepository(TransaccionDetalle);
  }

  async findAll(): Promise<Transaccion[]> {
    return this.repo.find({ 
      relations: ['mesa', 'cajera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<Transaccion | null> {
    return this.repo.findOne({ 
      where: { id },
      relations: ['mesa', 'cajera']
    });
  }

  async findByNumero(numero: string): Promise<Transaccion | null> {
    return this.repo.findOne({ 
      where: { numeroTransaccion: numero },
      relations: ['mesa', 'cajera']
    });
  }

  async findByMesa(mesaId: string): Promise<Transaccion[]> {
    return this.repo.find({ 
      where: { mesaId },
      relations: ['mesa', 'cajera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByCajera(cajeraId: string): Promise<Transaccion[]> {
    return this.repo.find({ 
      where: { cajeraId },
      relations: ['mesa', 'cajera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByFormaPago(formaPago: FormaPago): Promise<Transaccion[]> {
    return this.repo.find({ 
      where: { formaPago },
      relations: ['mesa', 'cajera'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByDateRange(start: Date, end: Date): Promise<Transaccion[]> {
    return this.repo.createQueryBuilder('t')
      .where('t.createdAt BETWEEN :start AND :end', { start, end })
      .leftJoinAndSelect('t.mesa', 'mesa')
      .leftJoinAndSelect('t.cajera', 'cajera')
      .orderBy('t.createdAt', 'DESC')
      .getMany();
  }

  async save(transaccion: Transaccion): Promise<Transaccion> {
    return this.repo.save(transaccion);
  }

  async update(id: string, data: Partial<Transaccion>): Promise<Transaccion> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<Transaccion>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  /**
   * Genera el siguiente número de transacción
   */
  async generateNumero(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    const lastTransaccion = await this.repo
      .createQueryBuilder('t')
      .where('t.numeroTransaccion LIKE :prefix', { prefix: `TX${dateStr}%` })
      .orderBy('t.numeroTransaccion', 'DESC')
      .getOne();
    
    let secuencia = 1;
    if (lastTransaccion) {
      const lastNum = lastTransaccion.numeroTransaccion.slice(-4);
      secuencia = parseInt(lastNum, 10) + 1;
    }
    
    return `TX${dateStr}${secuencia.toString().padStart(4, '0')}`;
  }

  // === Transaccion Detalle ===

  async findDetallesByTransaccion(transaccionId: string): Promise<TransaccionDetalle[]> {
    return this.detalleRepo.find({ 
      where: { transaccionId },
      order: { id: 'ASC' }
    });
  }

  async addDetalle(detalle: TransaccionDetalle): Promise<TransaccionDetalle> {
    return this.detalleRepo.save(detalle);
  }

  async addDetalles(detalles: TransaccionDetalle[]): Promise<TransaccionDetalle[]> {
    return this.detalleRepo.save(detalles);
  }

  async clearDetalles(transaccionId: string): Promise<void> {
    await this.detalleRepo.delete({ transaccionId });
  }
}