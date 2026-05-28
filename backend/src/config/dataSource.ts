import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Categoria } from './entities/Categoria.js';
import { Producto } from './entities/Producto.js';
import { Mesa } from './entities/Mesa.js';
import { ExchangeRate } from './entities/ExchangeRate.js';
import { Pedido } from './entities/Pedido.js';
import { PedidoItem } from './entities/PedidoItem.js';
import { Transaccion } from './entities/Transaccion.js';
import { TransaccionDetalle } from './entities/TransaccionDetalle.js';
import { Caja } from './entities/Caja.js';
import { User } from './entities/User.js';
import { UserRole } from './entities/UserRole.js';

/**
 * TypeORM DataSource Configuration - POS System
 * Configuración centralizada para la conexión a PostgreSQL
 */
const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'bohio_db',
  synchronize: process.env.NODE_ENV !== 'production', // Solo en desarrollo!
  logging: process.env.NODE_ENV !== 'production',
  entityPrefix: 'bohio_',
  
  // Entidades - POS System
  entities: [
    Categoria,
    Producto,
    Mesa,
    ExchangeRate,
    Pedido,
    PedidoItem,
    Transaccion,
    TransaccionDetalle,
    Caja,
    User,
    UserRole,
  ],
  
  // Migraciones (solo en producción)
  migrations: process.env.NODE_ENV === 'production' 
    ? ['dist/migrations/*.js'] 
    : ['src/migrations/*.ts'],
  
  // Subscribers
  subscribers: [],
  
  // Pool settings
  extra: {
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  
  // SSL para producción
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
};

// Exportar DataSource
export const AppDataSource = new DataSource(config);

// Helper para inicializar
export async function initializeDatabase(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('✅ Database connected');
  }
  return AppDataSource;
}

// Helper para cerrar
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Database disconnected');
  }
}

export default AppDataSource;