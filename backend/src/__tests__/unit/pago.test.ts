import { describe, it, expect } from 'vitest';
import {
  calcularCambio,
  convertirAUsd,
  generarNumTransaccion,
  validarMontoRecibido,
} from '../../utils/pago.ts';

describe('calcularCambio', () => {
  it('devuelve cambio positivo cuando se paga de más', () => {
    expect(calcularCambio(15000, 20000)).toBe(5000);
  });

  it('devuelve 0 cuando el monto es exacto', () => {
    expect(calcularCambio(15000, 15000)).toBe(0);
  });

  it('devuelve 0 cuando se paga de menos (no permite negativo)', () => {
    expect(calcularCambio(15000, 10000)).toBe(0);
  });

  it('funciona con decimales', () => {
    expect(calcularCambio(150.50, 200)).toBe(49.5);
  });

  it('funciona con monto 0', () => {
    expect(calcularCambio(100, 0)).toBe(0);
  });
});

describe('convertirAUsd', () => {
  it('convierte correctamente con tasa 4000', () => {
    expect(convertirAUsd(20000, 4000)).toBeCloseTo(5.0);
  });

  it('convierte correctamente con tasa 3900', () => {
    expect(convertirAUsd(3900, 3900)).toBeCloseTo(1.0);
  });

  it('convierte 0 correctamente', () => {
    expect(convertirAUsd(0, 4000)).toBe(0);
  });

  it('lanza error si la tasa es cero', () => {
    expect(() => convertirAUsd(20000, 0)).toThrow('Tasa inválida');
  });

  it('lanza error si la tasa es negativa', () => {
    expect(() => convertirAUsd(20000, -100)).toThrow('Tasa inválida');
  });

  it('redondea correctamente a 2 decimales', () => {
    const resultado = convertirAUsd(15555, 3900);
    expect(resultado).toBeCloseTo(3.99, 2);
  });
});

describe('generarNumTransaccion', () => {
  it('sigue el formato TXN-YYYYMMDD-XXXX', () => {
    const num = generarNumTransaccion(1);
    expect(num).toMatch(/^TXN-\d{8}-\d{4}$/);
  });

  it('usa el contador para el sufijo con padding', () => {
    expect(generarNumTransaccion(1)).toContain('-0001');
    expect(generarNumTransaccion(42)).toContain('-0042');
    expect(generarNumTransaccion(123)).toContain('-0123');
    expect(generarNumTransaccion(9999)).toContain('-9999');
  });

  it('genera números diferentes para contadores diferentes', () => {
    const num1 = generarNumTransaccion(1);
    const num2 = generarNumTransaccion(2);
    expect(num1).not.toBe(num2);
  });
});

describe('validarMontoRecibido', () => {
  it('retorna true si el monto es mayor al total en efectivo local', () => {
    expect(validarMontoRecibido(15000, 20000, 'efectivo_local')).toBe(true);
  });

  it('retorna true si el monto es exacto', () => {
    expect(validarMontoRecibido(15000, 15000, 'efectivo_local')).toBe(true);
  });

  it('retorna false si el monto es menor al total', () => {
    expect(validarMontoRecibido(15000, 10000, 'efectivo_local')).toBe(false);
  });

  it('retorna true para tarjeta sin verificar monto', () => {
    expect(validarMontoRecibido(15000, 0, 'tarjeta')).toBe(true);
  });

  it('retorna true para pago mixto con monto suficiente', () => {
    expect(validarMontoRecibido(15000, 15000, 'mixto')).toBe(true);
  });

  it('retorna true para USD con monto suficiente', () => {
    expect(validarMontoRecibido(15000, 15000, 'efectivo_usd')).toBe(true);
  });
});