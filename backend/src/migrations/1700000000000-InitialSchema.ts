import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

/**
 * Initial Schema Migration
 * Crea todas las tablas del proyecto
 */
export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Categories
    await queryRunner.createTable(
      new Table({
        name: 'bohio_categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'icon', type: 'varchar', length: '50', isNullable: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true
    );

    // 2. Menu Items
    await queryRunner.createTable(
      new Table({
        name: 'bohio_menu_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', length: '200' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'categoryId', type: 'uuid' },
          { name: 'imageUrl', type: 'varchar', length: '500', isNullable: true },
          { name: 'available', type: 'boolean', default: true },
          { name: 'featured', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true
    );

    // Foreign key for Menu Items -> Category
    await queryRunner.createForeignKey(
      'bohio_menu_items',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedTableName: 'bohio_categories',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // 3. Orders
    await queryRunner.createTable(
      new Table({
        name: 'bohio_orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'orderNumber', type: 'varchar', length: 20, isUnique: true },
          { name: 'customerName', type: 'varchar', length: 200 },
          { name: 'customerPhone', type: 'varchar', length: 20 },
          { name: 'orderType', type: 'varchar', length: 20, default: "'pickup'" },
          { name: 'deliveryAddress', type: 'text', isNullable: true },
          { name: 'total', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'status', type: 'varchar', length: 20, default: "'pending'" },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true
    );

    // 4. Order Items
    await queryRunner.createTable(
      new Table({
        name: 'bohio_order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'orderId', type: 'uuid' },
          { name: 'menuItemId', type: 'uuid' },
          { name: 'quantity', type: 'int', default: 1 },
          { name: 'unitPrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'subtotal', type: 'decimal', precision: 10, scale: 2 },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true
    );

    // Foreign key for Order Items -> Order
    await queryRunner.createForeignKey(
      'bohio_order_items',
      new TableForeignKey({
        columnNames: ['orderId'],
        referencedTableName: 'bohio_orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // 5. Reservations
    await queryRunner.createTable(
      new Table({
        name: 'bohio_reservations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'customerName', type: 'varchar', length: 200 },
          { name: 'customerPhone', type: 'varchar', length: 20 },
          { name: 'guests', type: 'int', default: 1 },
          { name: 'reservationDate', type: 'date' },
          { name: 'reservationTime', type: 'time' },
          { name: 'status', type: 'varchar', length: 20, default: "'pending'" },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true
    );

    // 6. Reviews
    await queryRunner.createTable(
      new Table({
        name: 'bohio_reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'customerName', type: 'varchar', length: 200 },
          { name: 'rating', type: 'int' },
          { name: 'comment', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true
    );

    // 7. Users
    await queryRunner.createTable(
      new Table({
        name: 'bohio_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'email', type: 'varchar', length: 255, isUnique: true },
          { name: 'passwordHash', type: 'varchar', length: 255 },
          { name: 'firstName', type: 'varchar', length: 100, isNullable: true },
          { name: 'lastName', type: 'varchar', length: 100, isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true
    );

    // 8. User Roles
    await queryRunner.createTable(
      new Table({
        name: 'bohio_user_roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'userId', type: 'uuid' },
          { name: 'role', type: 'varchar', length: 20, default: "'user'" },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true
    );

    // Habilitar UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bohio_user_roles');
    await queryRunner.dropTable('bohio_users');
    await queryRunner.dropTable('bohio_reviews');
    await queryRunner.dropTable('bohio_reservations');
    await queryRunner.dropTable('bohio_order_items');
    await queryRunner.dropTable('bohio_orders');
    await queryRunner.dropTable('bohio_menu_items');
    await queryRunner.dropTable('bohio_categories');
  }
}