import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { ExchangeRate } from '../../config/entities/ExchangeRate.js';

/**
 * ExchangeRate Repository - TypeORM Implementation
 * Only ONE active rate at a time
 */
export class ExchangeRateRepository {
  private repo: Repository<ExchangeRate>;

  constructor() {
    this.repo = AppDataSource.getRepository(ExchangeRate);
  }

  async findAll(): Promise<ExchangeRate[]> {
    return this.repo.find({ 
      order: { createdAt: 'DESC' } 
    });
  }

  async findById(id: string): Promise<ExchangeRate | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findActive(): Promise<ExchangeRate | null> {
    return this.repo.findOne({ where: { activa: true } });
  }

  async save(rate: ExchangeRate): Promise<ExchangeRate> {
    return this.repo.save(rate);
  }

  async update(id: string, data: Partial<ExchangeRate>): Promise<ExchangeRate> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<ExchangeRate>;
  }

  /**
   * Desactiva todas las tasas y activa la especificada
   */
  async setActive(id: string): Promise<ExchangeRate> {
    // Desactivar todas las tasas primero
    const all = await this.repo.find();
    for (const r of all) {
      if (r.activa) {
        await this.repo.update(r.id, { activa: false });
      }
    }
    // Activar la tasa especificada
    await this.repo.update(id, { activa: true });
    return this.findById(id) as Promise<ExchangeRate>;
  }

  /**
   * Crea una nueva tasa y la activa, desactivando las anteriores
   */
  async createAndActivate(data: {
    tasa: number;
    moneda?: string;
    monedaBase?: string;
    creadaPor?: string;
  }): Promise<ExchangeRate> {
    // Desactivar todas las tasas existentes
    const all = await this.repo.find();
    for (const r of all) {
      if (r.activa) {
        await this.repo.update(r.id, { activa: false });
      }
    }
    
    // Crear nueva tasa activa
    const rate = new ExchangeRate();
    Object.assign(rate, {
      ...data,
      activa: true,
      moneda: data.moneda || 'USD',
      monedaBase: data.monedaBase || 'CUP'
    });
    
    return this.repo.save(rate);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}