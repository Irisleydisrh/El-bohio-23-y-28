import express, { Application, Request, Response, NextFunction } from 'express';
import { MenuService } from '../application/MenuService.js';
import { OrderService } from '../application/OrderService.js';
import { ReservationService } from '../application/ReservationService.js';
import { ReviewService } from '../application/ReviewService.js';
import { MesaService } from '../application/MesaService.js';
import { ExchangeRateService } from '../application/ExchangeRateService.js';
import { PedidoService } from '../application/PedidoService.js';
import { TransaccionService } from '../application/TransaccionService.js';
import { AppDataSource, initializeDatabase, closeDatabase } from '../config/dataSource.js';
import { AppError } from '../shared/errors/AppError.js';
import { createMenuRoutes } from './routes/menuRoutes.js';
import { createOrderRoutes } from './routes/orderRoutes.js';
import { createReservationRoutes } from './routes/reservationRoutes.js';
import { createReviewRoutes } from './routes/reviewRoutes.js';
import mesaRoutes from './routes/mesaRoutes.js';
import tasaRoutes from './routes/tasaRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import transaccionRoutes from './routes/transaccionRoutes.js';
import menuPosRoutes from './routes/menuPosRoutes.js';

/**
 * Express Server - Presentation Layer
 * Entry point for the API with TypeORM
 */
export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS headers
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Initialize Services
  const menuService = new MenuService();
  const orderService = new OrderService();
  const reservationService = new ReservationService();
  const reviewService = new ReviewService();
  const mesaService = new MesaService();
  const tasaService = new ExchangeRateService();
  const pedidoService = new PedidoService();
  const transaccionService = new TransaccionService();

  // Routes - Website
  app.use('/api/menu', createMenuRoutes(menuService));
  app.use('/api/orders', createOrderRoutes(orderService));
  app.use('/api/reservations', createReservationRoutes(reservationService));
  app.use('/api/reviews', createReviewRoutes(reviewService));

  // Routes - POS
  app.use('/api/mesas', mesaRoutes);
  app.use('/api/tasas', tasaRoutes);
  app.use('/api/pedidos', pedidoRoutes);
  app.use('/api/transacciones', transaccionRoutes);
  app.use('/api-pos', menuPosRoutes);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString() 
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { message: 'Endpoint not found', code: 'NOT_FOUND' }
    });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);
    
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        success: false,
        error: { message: err.message, code: err.code }
      });
    }

    res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_ERROR' }
    });
  });

  return app;
}

// Start server
async function main() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    const app = createApp();
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`\n🚀 El Bohío Backend running on http://localhost:${PORT}`);
      console.log(`📋 Endpoints:`);
      console.log(`   GET  /health`);
      console.log(`   --- Website ---`);
      console.log(`   GET  /api/menu/full`);
      console.log(`   GET  /api/menu/categories`);
      console.log(`   GET  /api/menu/items`);
      console.log(`   POST /api/orders`);
      console.log(`   POST /api/reservations`);
      console.log(`   POST /api/reviews`);
      console.log(`   --- POS ---`);
      console.log(`   GET    /api/mesas`);
      console.log(`   GET    /api/mesas/:id`);
      console.log(`   POST   /api/mesas`);
      console.log(`   PUT    /api/mesas/:id`);
      console.log(`   GET    /api/tasas`);
      console.log(`   GET    /api/tasas/activa`);
      console.log(`   POST   /api/tasas`);
      console.log(`   GET    /api/pedidos`);
      console.log(`   GET    /api/pedidos/activos`);
      console.log(`   POST   /api/pedidos`);
      console.log(`   POST   /api/pedidos/:id/items`);
      console.log(`   POST   /api/transacciones/cerrar`);
      console.log(`   GET    /api/transacciones/:id/ticket\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await closeDatabase();
  process.exit(0);
});

main();