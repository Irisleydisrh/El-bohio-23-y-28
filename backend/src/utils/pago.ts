/**
 * Utilidades de pago para el sistema POS
 */

/**
 * Calcula el cambio a devolver al cliente
 * @param total - El total del pedido
 * @param montoRecibido - El monto recibido del cliente
 * @returns El cambio a devolver (0 si el monto es menor al total)
 */
export function calcularCambio(total: number, montoRecibido: number): number {
  if (montoRecibido < total) return 0;
  return montoRecibido - total;
}

/**
 * Convierte un monto de CUP a USD usando la tasa de cambio
 * @param montoCUP - Monto en CUP
 * @param tasa - Tasa de cambio (CUP por USD)
 * @returns Monto en USD
 * @throws Error si la tasa es cero o negativa
 */
export function convertirAUsd(montoCUP: number, tasa: number): number {
  if (tasa <= 0) {
    throw new Error('Tasa inválida: debe ser mayor a 0');
  }
  return montoCUP / tasa;
}

/**
 * Genera un número de transacción único
 * @param contador - Número secuencial
 * @returns Número de transacción en formato TXN-YYYYMMDD-XXXX
 */
export function generarNumTransaccion(contador: number): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const dia = String(ahora.getDate()).padStart(2, '0');
  const secuencia = String(contador).padStart(4, '0');
  return `TXN-${anio}${mes}${dia}-${secuencia}`;
}

/**
 * Valida que el monto recibido sea suficiente
 * @param total - Total del pedido
 * @param montoRecibido - Monto recibido
 * @param formaPago - Forma de pago
 * @returns true si el monto es válido
 */
export function validarMontoRecibido(
  total: number,
  montoRecibido: number,
  formaPago: 'efectivo_local' | 'efectivo_usd' | 'mixto' | 'tarjeta'
): boolean {
  // Tarjeta no requiere monto exacto
  if (formaPago === 'tarjeta') return true;
  
  // Para efectivo, debe ser al menos el total
  return montoRecibido >= total;
}