import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Category } from '../config/entities/Category.js';
import { MenuItem } from '../config/entities/MenuItem.js';
import { Order } from '../config/entities/Order.js';
import { OrderItem } from '../config/entities/OrderItem.js';
import { Reservation } from '../config/entities/Reservation.js';
import { Review } from '../config/entities/Review.js';
import { User } from '../config/entities/User.js';
import { UserRole } from '../config/entities/UserRole.js';

/**
 * TypeORM CLI Configuration
 * Usado para migraciones desde línea de comandos
 */
const ormConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'bohio_db',
  synchronize: false,
  logging: false,
  entityPrefix: 'bohio_',
  
  // Entidades
  entities: [
    Category,
    MenuItem,
    Order,
    OrderItem,
    Reservation,
    Review,
    User,
    UserRole,
  ],
  
  // Migraciones
  migrations: ['src/migrations/*.ts'],
  
  // Metadata
  migrationsTableName: 'bohio_migrations',
  
  //SSL
  ssl: false,
};

export default new DataSource(ormConfig);