import { ExchangeRate } from '../config/entities/ExchangeRate.js';
import { ExchangeRateRepository } from './repositories/ExchangeRateRepository.js';

/**
 * ExchangeRate Service - Application Layer
 * Manejo de tasas de cambio (solo UNA activa a la vez)
 */
export class ExchangeRateService {
  private repo: ExchangeRateRepository;

  constructor() {
    this.repo = new ExchangeRateRepository();
  }

  /**
   * Obtiene todas las tasas
   */
  async getAll(): Promise<ExchangeRate[]> {
    return this.repo.findAll();
  }

  /**
   * Obtiene una tasa por ID
   */
  async getById(id: string): Promise<ExchangeRate | null> {
    return this.repo.findById(id);
  }

  /**
   * Obtiene la tasa activa actual
   */
  async getActive(): Promise<ExchangeRate | null> {
    return this.repo.findActive();
  }

  /**
   * Crea una nueva tasa y la activa (desactiva las anteriores)
   */
  async create(data: {
    tasa: number;
    moneda?: string;
    monedaBase?: string;
    creadaPor?: string;
  }): Promise<ExchangeRate> {
    if (data.tasa <= 0) {
      throw new Error('La tasa debe ser mayor a 0');
    }

    return this.repo.createAndActivate(data);
  }

  /**
   * Actualiza una tasa existente
   */
  async update(id: string, data: {
    tasa?: number;
    activa?: boolean;
  }): Promise<ExchangeRate> {
    const rate = await this.repo.findById(id);
    if (!rate) {
      throw new Error('Tasa no encontrada');
    }

    if (data.tasa !== undefined && data.tasa <= 0) {
      throw new Error('La tasa debe ser mayor a 0');
    }

    // Si se va a activar, desactivar las demás
    if (data.activa === true) {
      return this.repo.setActive(id);
    }

    return this.repo.update(id, data);
  }

  /**
   * Activa una tasa existente (desactiva las demás)
   */
  async activate(id: string): Promise<ExchangeRate> {
    const rate = await this.repo.findById(id);
    if (!rate) {
      throw new Error('Tasa no encontrada');
    }

    return this.repo.setActive(id);
  }

  /**
   * Elimina una tasa (solo si no está activa)
   */
  async delete(id: string): Promise<void> {
    const rate = await this.repo.findById(id);
    if (!rate) {
      throw new Error('Tasa no encontrada');
    }

    if (rate.activa) {
      throw new Error('No se puede eliminar la tasa activa');
    }

    await this.repo.delete(id);
  }

  /**
   * Obtiene la tasa actual, o lanza error si no hay
   */
  async getTasaActivaRequerida(): Promise<ExchangeRate> {
    const rate = await this.repo.findActive();
    if (!rate) {
      throw new Error('No hay tasa de cambio activa. Configure una tasa primero.');
    }
    return rate;
  }
}