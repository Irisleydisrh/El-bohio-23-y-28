import { AppDataSource } from '../config/dataSource.js';
import { Caja, CajaEstado } from '../config/entities/Caja.js';

export class CajaService {
  private repo = AppDataSource.getRepository(Caja);

  async getAbierta(): Promise<Caja | null> {
    return this.repo.findOne({ where: { estado: CajaEstado.ABIERTA } });
  }

  async getAbiertaOError(): Promise<Caja> {
    const caja = await this.getAbierta();
    if (!caja) {
      throw new Error('No hay caja abierta. Debe abrir la caja antes de cobrar.');
    }
    return caja;
  }

  async abrir(data: { cajeroId: string; cajeroNombre: string; aperturaLocal?: number; aperturaUSD?: number }): Promise<Caja> {
    const yaAbierta = await this.getAbierta();
    if (yaAbierta) {
      throw new Error(`La caja ya está abierta desde las ${new Date(yaAbierta.createdAt).toLocaleTimeString('es-CU')}`);
    }

    const hoy = new Date().toISOString().split('T')[0];
    const caja = this.repo.create({
      estado: CajaEstado.ABIERTA,
      cajeroId: data.cajeroId,
      cajeroNombre: data.cajeroNombre,
      aperturaLocal: Number(data.aperturaLocal) || 0,
      aperturaUSD: Number(data.aperturaUSD) || 0,
      totalVentasLocal: 0,
      totalVentasUSD: 0,
      fechaApertura: hoy,
    });

    return this.repo.save(caja);
  }

  async cerrar(data: { observaciones?: string }): Promise<Caja> {
    const caja = await this.getAbiertaOError();
    const hoy = new Date().toISOString().split('T')[0];

    // Acumular ventas del día desde transacciones
    const ventas = await this.repo.query(`
      SELECT COALESCE(SUM("totalLocal"), 0) as "totalLocal", COALESCE(SUM("totalUSD"), 0) as "totalUSD"
      FROM bohio_transacciones
      WHERE DATE("createdAt") = $1
    `, [hoy]);

    caja.estado = CajaEstado.CERRADA;
    caja.cierreLocal = Number(caja.aperturaLocal) + Number(ventas[0]?.totalLocal || 0);
    caja.cierreUSD = Number(caja.aperturaUSD) + Number(ventas[0]?.totalUSD || 0);
    caja.observacionesCierre = data.observaciones || null;
    caja.fechaCierre = hoy;

    return this.repo.save(caja);
  }

  async getDelDia(): Promise<Caja | null> {
    const hoy = new Date().toISOString().split('T')[0];
    return this.repo.findOne({ where: { fechaApertura: hoy } });
  }
}