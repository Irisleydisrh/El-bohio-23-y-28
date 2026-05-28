/**
 * DTO para crear o actualizar una mesa
 */
export interface CreateMesaDto {
  numero: number;
  capacidad?: number;
  nombre?: string;
  posicionX?: number;
  posicionY?: number;
}

export interface UpdateMesaDto {
  numero?: number;
  capacidad?: number;
  nombre?: string;
  posicionX?: number;
  posicionY?: number;
}