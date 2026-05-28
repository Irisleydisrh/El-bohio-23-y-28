import { describe, it, expect } from 'vitest';
import {
  productoSchema,
  categoriaSchema,
  crearPedidoSchema,
  pagoSchema,
  cajaSchema,
  tasaCambioSchema,
  loginSchema,
} from '../../schemas/index.ts';

describe('productoSchema', () => {
  it('acepta producto válido', () => {
    const result = productoSchema.safeParse({
      nombre: 'Hamburguesa',
      precio: 15000,
      categoriaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    });
    expect(result.success).toBe(true);
  });

  it('acepta producto con todos los campos opcionales', () => {
    const result = productoSchema.safeParse({
      nombre: 'Refresco',
      descripcion: 'Bebida fría',
      precio: 2000,
      categoriaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      activo: true,
      destacado: false,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza precio negativo', () => {
    const result = productoSchema.safeParse({
      nombre: 'Test',
      precio: -100,
      categoriaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza precio cero', () => {
    const result = productoSchema.safeParse({
      nombre: 'Test',
      precio: 0,
      categoriaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre vacío', () => {
    const result = productoSchema.safeParse({
      nombre: '',
      precio: 1000,
      categoriaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre muy largo', () => {
    const result = productoSchema.safeParse({
      nombre: 'a'.repeat(101),
      precio: 1000,
      categoriaId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    });
    expect(result.success).toBe(false);
  });
});

describe('crearPedidoSchema', () => {
  const uuidValido = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  it('acepta pedido válido', () => {
    const result = crearPedidoSchema.safeParse({
      mesaId: uuidValido,
      meseraId: uuidValido,
      items: [{ productoId: uuidValido, cantidad: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it('acepta pedido con descuento', () => {
    const result = crearPedidoSchema.safeParse({
      mesaId: uuidValido,
      meseraId: uuidValido,
      items: [{ productoId: uuidValido, cantidad: 1 }],
      descuento: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza pedido sin items', () => {
    const result = crearPedidoSchema.safeParse({
      mesaId: uuidValido,
      meseraId: uuidValido,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it('rechaza cantidad cero', () => {
    const result = crearPedidoSchema.safeParse({
      mesaId: uuidValido,
      meseraId: uuidValido,
      items: [{ productoId: uuidValido, cantidad: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rechaza descuento negativo', () => {
    const result = crearPedidoSchema.safeParse({
      mesaId: uuidValido,
      meseraId: uuidValido,
      items: [{ productoId: uuidValido, cantidad: 1 }],
      descuento: -10,
    });
    expect(result.success).toBe(false);
  });
});

describe('pagoSchema', () => {
  const uuidValido = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  it('acepta pago en efectivo local válido', () => {
    const result = pagoSchema.safeParse({
      pedidoId: uuidValido,
      mesaId: uuidValido,
      formaPago: 'efectivo_local',
      montoRecibidoLocal: 20000,
    });
    expect(result.success).toBe(true);
  });

  it('acepta pago con tarjeta', () => {
    const result = pagoSchema.safeParse({
      pedidoId: uuidValido,
      mesaId: uuidValido,
      formaPago: 'tarjeta',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza efectivo local sin monto', () => {
    const result = pagoSchema.safeParse({
      pedidoId: uuidValido,
      mesaId: uuidValido,
      formaPago: 'efectivo_local',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza efectivo local con monto cero', () => {
    const result = pagoSchema.safeParse({
      pedidoId: uuidValido,
      mesaId: uuidValido,
      formaPago: 'efectivo_local',
      montoRecibidoLocal: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe('cajaSchema', () => {
  const uuidValido = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  it('acepta datos válidos para abrir caja', () => {
    const result = cajaSchema.safeParse({
      cajeroId: uuidValido,
      cajeroNombre: 'Juan Pérez',
      aperturaLocal: 5000,
      aperturaUSD: 100,
    });
    expect(result.success).toBe(true);
  });

  it('acepta montos opcionales', () => {
    const result = cajaSchema.safeParse({
      cajeroId: uuidValido,
      cajeroNombre: 'Juan Pérez',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza nombre vacío', () => {
    const result = cajaSchema.safeParse({
      cajeroId: uuidValido,
      cajeroNombre: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('tasaCambioSchema', () => {
  it('acepta tasa válida', () => {
    const result = tasaCambioSchema.safeParse({
      tasa: 3900,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza tasa cero', () => {
    const result = tasaCambioSchema.safeParse({
      tasa: 0,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza tasa negativa', () => {
    const result = tasaCambioSchema.safeParse({
      tasa: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.safeParse({
      username: 'cajero@elbohio.com',
      password: 'cajero123',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza usuario vacío', () => {
    const result = loginSchema.safeParse({
      username: '',
      password: 'cajero123',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza contraseña vacía', () => {
    const result = loginSchema.safeParse({
      username: 'cajero@elbohio.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});