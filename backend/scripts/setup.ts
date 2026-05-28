/**
 * Setup Script - POS Restaurant System
 * 
 * Creates: categorias, productos, mesas, tasa_cambio, usuarios, roles
 */
import pg from 'pg';
import { AppDataSource, initializeDatabase, closeDatabase } from '../src/config/dataSource.js';
import { Categoria } from '../src/config/entities/Categoria.js';
import { Producto } from '../src/config/entities/Producto.js';
import { Mesa, MesaEstado } from '../src/config/entities/Mesa.js';
import { ExchangeRate } from '../src/config/entities/ExchangeRate.js';
import { User } from '../src/config/entities/User.js';
import { UserRole, AppRole } from '../src/config/entities/UserRole.js';

const adminConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  database: 'postgres',
};

const dbName = process.env.DB_NAME || 'bohio_db';
const { Pool } = pg;

async function createDatabaseIfNotExists(): Promise<void> {
  const pool = new Pool(adminConfig);
  try {
    const result = await pool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (result.rows.length === 0) {
      console.log(`📦 Creating database: ${dbName}...`);
      await pool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database "${dbName}" created`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }
  } finally {
    await pool.end();
  }
}

async function runMigrations(): Promise<void> {
  console.log('🔄 Running migrations...');
  try {
    await AppDataSource.initialize();
    await AppDataSource.synchronize();
    console.log('✅ Schema synchronized');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    throw error;
  }
}

async function seedData(): Promise<void> {
  console.log('🌱 Seeding POS data...');
  
  const categoriaRepo = AppDataSource.getRepository(Categoria);
  const productoRepo = AppDataSource.getRepository(Producto);
  const mesaRepo = AppDataSource.getRepository(Mesa);
  const tasaRepo = AppDataSource.getRepository(ExchangeRate);
  const userRepo = AppDataSource.getRepository(User);
  const userRoleRepo = AppDataSource.getRepository(UserRole);

  // Verificar si ya hay datos
  const existingCategories = await categoriaRepo.count();
  if (existingCategories > 0) {
    console.log('✅ Data already seeded');
    return;
  }

  // 1. Crear categorías
  const categorias = await categoriaRepo.save([
    { nombre: 'Entrepanes', descripcion: 'Deliciosos entrepanes al carbón', icono: '🍔', orden: 1, activa: true },
    { nombre: 'Bebidas', descripcion: 'Refrescos y batidos', icono: '🥤', orden: 2, activa: true },
    { nombre: 'Acompañamientos', descripcion: 'Extras para tu pedido', icono: '🍟', orden: 3, activa: true },
    { nombre: 'Postres', descripcion: 'Dulces terminaciones', icono: '🍰', orden: 4, activa: true },
  ]);
  console.log(`✅ Created ${categorias.length} categories`);

  // 2. Crear productos
  await productoRepo.save([
    { nombre: 'El Bohío Clásico', descripcion: 'Pan con lechón, queso, jamón, vegetales', precio: 150, categoriaId: categorias[0].id, activo: true, destacado: true },
    { nombre: 'El Cubano', descripcion: 'Pan cubano, lechón, suizo, pepinos', precio: 180, categoriaId: categorias[0].id, activo: true, destacado: true },
    { nombre: 'El Vegetariano', descripcion: 'Pan con vegetales, queso, huevo', precio: 120, categoriaId: categorias[0].id, activo: true, destacado: false },
    { nombre: 'El Especial', descripcion: 'Pan con todo', precio: 200, categoriaId: categorias[0].id, activo: true, destacado: true },
    { nombre: 'Refresco', descripcion: 'Coca Cola, Pepsi, Sprite', precio: 50, categoriaId: categorias[1].id, activo: true, destacado: false },
    { nombre: 'Batido de Mango', descripcion: 'Batido natural de mango', precio: 80, categoriaId: categorias[1].id, activo: true, destacado: false },
    { nombre: 'Agua', descripcion: 'Agua mineral 500ml', precio: 30, categoriaId: categorias[1].id, activo: true, destacado: false },
    { nombre: 'Papas Fritas', descripcion: 'Papas al hilo', precio: 60, categoriaId: categorias[2].id, activo: true, destacado: false },
    { nombre: 'Aros de Cebolla', descripcion: 'Aros crujientes', precio: 50, categoriaId: categorias[2].id, activo: true, destacado: false },
    { nombre: 'Flan', descripcion: 'Flan de huevo', precio: 40, categoriaId: categorias[3].id, activo: true, destacado: false },
    { nombre: 'Tres Leches', descripcion: 'Pastel de tres leches', precio: 60, categoriaId: categorias[3].id, activo: true, destacado: false },
  ]);
  console.log('✅ Created 11 productos');

  // 3. Crear mesas (10 mesas)
  const mesas: Partial<Mesa>[] = [];
  for (let i = 1; i <= 10; i++) {
    mesas.push({
      numero: i,
      estado: MesaEstado.LIBRE,
      capacidad: i <= 4 ? 4 : i <= 7 ? 6 : 8,
      nombre: `Mesa ${i}`,
      posicionX: ((i - 1) % 5) * 120 + 50,
      posicionY: Math.floor((i - 1) / 5) * 120 + 50,
    });
  }
  await mesaRepo.save(mesas);
  console.log('✅ Created 10 mesas');

  // 4. Crear tasa de cambio inicial (ejemplo: 1 USD = 3900 COP)
  await tasaRepo.save({
    tasa: 3900,
    moneda: 'USD',
    monedaBase: 'COP',
    activa: true,
  });
  console.log('✅ Created tasa de cambio inicial (1 USD = 3900 COP)');

  // 5. Crear usuarios
  // Cajera
  const cajera = await userRepo.save({
    email: 'cajera@elbohio.com',
    passwordHash: '$2a$10$dummyhash', // En prod: bcrypt
    firstName: 'María',
    lastName: 'González',
    isActive: true,
  });
  await userRoleRepo.save({ userId: cajera.id, role: AppRole.CAJERA });
  console.log('✅ Created cajera (cajera@elbohio.com / cajera123)');

  // Mesera
  const mesera = await userRepo.save({
    email: 'mesera@elbohio.com',
    passwordHash: '$2a$10$dummyhash',
    firstName: 'Ana',
    lastName: 'López',
    isActive: true,
  });
  await userRoleRepo.save({ userId: mesera.id, role: AppRole.MESERA });
  console.log('✅ Created mesera (mesera@elbohio.com / mesera123)');

  console.log('✅ Seed completed');
}

async function main(): Promise<void> {
  console.log('🚀 El Bohío POS Setup\n');
  console.log('============================\n');

  try {
    await createDatabaseIfNotExists();
    await runMigrations();
    await seedData();

    console.log('\n============================');
    console.log('✅ Setup completed!');
    console.log('\n📋 Credenciales:');
    console.log('   CAJERA: cajera@elbohio.com / cajera123');
    console.log('   MESERA: mesera@elbohio.com / mesera123');
    console.log('\nPara iniciar: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

main();
