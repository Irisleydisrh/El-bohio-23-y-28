/**
 * DTO para crear o actualizar una tasa de cambio
 */
export interface CreateExchangeRateDto {
  tasa: number;
  moneda?: string;
  monedaBase?: string;
  creadaPor?: string;
}

export interface UpdateExchangeRateDto {
  tasa?: number;
  activa?: boolean;
}