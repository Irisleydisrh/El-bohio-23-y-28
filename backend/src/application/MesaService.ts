import { Mesa, MesaEstado } from '../config/entities/Mesa.js';
import { MesaRepository } from './repositories/MesaRepository.js';

/**
 * Mesa Service - Application Layer
 * Manejo de mesas físicas del restaurante
 */
export class MesaService {
  private repo: MesaRepository;

  constructor() {
    this.repo = new MesaRepository();
  }

  /**
   * Obtiene todas las mesas
   */
  async getAll(): Promise<Mesa[]> {
    return this.repo.findAll();
  }

  /**
   * Obtiene una mesa por ID
   */
  async getById(id: string): Promise<Mesa | null> {
    return this.repo.findById(id);
  }

  /**
   * Obtiene una mesa por número
   */
  async getByNumero(numero: number): Promise<Mesa | null> {
    return this.repo.findByNumero(numero);
  }

  /**
   * Obtiene mesas por estado
   */
  async getByEstado(estado: MesaEstado): Promise<Mesa[]> {
    return this.repo.findByEstado(estado);
  }

  /**
   * Obtiene todas las mesas con su estado actual
   */
  async getAllConEstado(): Promise<Mesa[]> {
    return this.repo.findAll();
  }

  /**
   * Crea una nueva mesa
   */
  async create(data: {
    numero: number;
    capacidad?: number;
    nombre?: string;
    posicionX?: number;
    posicionY?: number;
  }): Promise<Mesa> {
    // Verificar que el número no existe
    const existing = await this.repo.findByNumero(data.numero);
    if (existing) {
      throw new Error(`Ya existe una mesa con el número ${data.numero}`);
    }

    const mesa = new Mesa();
    Object.assign(mesa, {
      ...data,
      estado: MesaEstado.LIBRE,
      capacidad: data.capacidad ?? 4,
      posicionX: data.posicionX ?? 0,
      posicionY: data.posicionY ?? 0
    });

    return this.repo.save(mesa);
  }

  /**
   * Actualiza una mesa
   */
  async update(id: string, data: Partial<Mesa>): Promise<Mesa> {
    const mesa = await this.repo.findById(id);
    if (!mesa) {
      throw new Error('Mesa no encontrada');
    }

    // Si cambia el número, verificar que no exista
    if (data.numero && data.numero !== mesa.numero) {
      const existing = await this.repo.findByNumero(data.numero);
      if (existing) {
        throw new Error(`Ya existe una mesa con el número ${data.numero}`);
      }
    }

    return this.repo.update(id, data);
  }

  /**
   * Libera una mesa (estado libre)
   */
  async liberar(id: string): Promise<Mesa> {
    const mesa = await this.repo.findById(id);
    if (!mesa) {
      throw new Error('Mesa no encontrada');
    }

    return this.repo.updateEstado(id, MesaEstado.LIBRE);
  }

  /**
   * Ocupa una mesa (estado ocupada)
   */
  async ocupar(id: string): Promise<Mesa> {
    const mesa = await this.repo.findById(id);
    if (!mesa) {
      throw new Error('Mesa no encontrada');
    }

    if (mesa.estado === MesaEstado.OCUPADA) {
      throw new Error('La mesa ya está ocupada');
    }

    return this.repo.updateEstado(id, MesaEstado.OCUPADA);
  }

  /**
   * Marca una mesa para cobrar (estado por_cobrar)
   */
  async marcarParaCobrar(id: string): Promise<Mesa> {
    const mesa = await this.repo.findById(id);
    if (!mesa) {
      throw new Error('Mesa no encontrada');
    }

    return this.repo.updateEstado(id, MesaEstado.POR_COBRAR);
  }

  /**
   * Elimina una mesa
   */
  async delete(id: string): Promise<void> {
    const mesa = await this.repo.findById(id);
    if (!mesa) {
      throw new Error('Mesa no encontrada');
    }

    // No eliminar si tiene pedidos activos
    if (mesa.estado !== MesaEstado.LIBRE) {
      throw new Error('No se puede eliminar una mesa que no está libre');
    }

    await this.repo.delete(id);
  }
}