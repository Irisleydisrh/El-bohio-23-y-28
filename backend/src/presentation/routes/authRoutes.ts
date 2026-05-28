import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../config/dataSource.js';
import { User } from '../../config/entities/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bohio-pos-secret-key-2024';

// Helper para verificar password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Helper para hashear password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper para generar token JWT
function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, rol: user.rol, nombre: user.firstName },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// Helper para verificar token
function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * POST /api/auth/login - Login con username y password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: username.toLowerCase() } });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const passwordValida = await verifyPassword(password, user.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = generateToken(user);
    const { passwordHash, ...userSafe } = user;
    
    res.json({
      token,
      usuario: userSafe
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/me - Obtener usuario actual (por token)
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: payload.id } });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const { passwordHash, ...userSafe } = user;
    res.json(userSafe);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/register - Registrar usuario
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, nombre, rol } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    const userRepo = AppDataSource.getRepository(User);
    
    const existing = await userRepo.findOne({ where: { email: username.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ error: 'El username ya está registrado' });
    }

    const passwordHash = await hashPassword(password);

    const user = userRepo.create({
      email: username.toLowerCase(),
      passwordHash,
      firstName: nombre || username,
      lastName: null,
      rol: rol || 'MESERO',
      isActive: true,
    });

    await userRepo.save(user);

    const { passwordHash: _, ...userSafe } = user;
    res.status(201).json(userSafe);
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;