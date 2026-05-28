/**
 * Entry Point - DEBE ser el primer import
 * Importa reflect-metadata antes que cualquier decorador de TypeORM
 */
import 'reflect-metadata';

// Ahora importamos el resto
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { MenuService } from './application/MenuService.js';
import { OrderService } from './application/OrderService.js';
import { ReservationService } from './application/ReservationService.js';
import { ReviewService } from './application/ReviewService.js';
import { MesaService } from './application/MesaService.js';
import { ExchangeRateService } from './application/ExchangeRateService.js';
import { PedidoService } from './application/PedidoService.js';
import { TransaccionService } from './application/TransaccionService.js';
import { AppDataSource, initializeDatabase, closeDatabase } from './config/dataSource.js';
import { AppError } from './shared/errors/AppError.js';
import { createMenuRoutes } from './presentation/routes/menuRoutes.js';
import { createOrderRoutes } from './presentation/routes/orderRoutes.js';
import { createReservationRoutes } from './presentation/routes/reservationRoutes.js';
import { createReviewRoutes } from './presentation/routes/reviewRoutes.js';
import mesaRoutes from './presentation/routes/mesaRoutes.js';
import tasaRoutes from './presentation/routes/tasaRoutes.js';
import pedidoRoutes from './presentation/routes/pedidoRoutes.js';
import transaccionRoutes from './presentation/routes/transaccionRoutes.js';
import menuPosRoutes from './presentation/routes/menuPosRoutes.js';
import cajaRoutes from './presentation/routes/cajaRoutes.js';
import authRoutes from './presentation/routes/authRoutes.js';
import type { Application, Request, Response, NextFunction } from 'express';

/**
 * Express Server - Presentation Layer
 */
function createApp(): Application {
  const app = express();

  // Security Middleware - Helmet
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'"], // Needed for some libraries
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for APIs
  }));

  // Rate Limiting - Global
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { success: false, error: { message: 'Demasiadas solicitudes, intenta más tarde', code: 'RATE_LIMITED' } },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Strict rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Only 10 attempts per 15 min
    message: { success: false, error: { message: 'Demasiados intentos de login', code: 'AUTH_RATE_LIMITED' } },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(globalLimiter);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });

  // Services
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
  app.use('/api/caja', cajaRoutes);
  
  // Auth routes with strict rate limiting
  app.use('/api/auth', authLimiter, authRoutes);

  // Health
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString() 
    });
  });

  // 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, error: { message: 'Not found', code: 'NOT_FOUND' } });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ success: false, error: { message: err.message, code: err.code } });
    }
    res.status(500).json({ success: false, error: { message: 'Internal error', code: 'INTERNAL_ERROR' } });
  });

  return app;
}

// Start server
async function main() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized');

    const app = createApp();
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`\n🚀 El Bohío Backend running on http://localhost:${PORT}`);
      console.log(`📋 Website Endpoints:`);
      console.log(`   GET  /health`);
      console.log(`   GET  /api/menu/full`);
      console.log(`   GET  /api/menu/categories`);
      console.log(`   GET  /api/menu/items`);
      console.log(`   POST /api/orders`);
      console.log(`   POST /api/reservations`);
      console.log(`   POST /api/reviews`);
      console.log(`📋 POS Endpoints:`);
      console.log(`   GET    /api/mesas`);
      console.log(`   GET    /api/tasas`);
      console.log(`   GET    /api/pedidos`);
      console.log(`   GET    /api/transacciones`);
      console.log(`   GET    /api-pos/menu`);
console.log(`   GET    /api-pos/categorias`);
    console.log(`📋 Caja Endpoints:`);
    console.log(`   GET    /api/caja`);
    console.log(`   GET    /api/caja/hoy`);
    console.log(`   POST   /api/caja/abrir`);
    console.log(`   POST   /api/caja/cerrar`);
    console.log(`📋 Auth Endpoints:`);
      console.log(`   POST   /api/auth/login`);
      console.log(`   POST   /api/auth/register`);
      console.log(`   GET    /api/auth/me\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down...');
  await closeDatabase();
  process.exit(0);
});

main();