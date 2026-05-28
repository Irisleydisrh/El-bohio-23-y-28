import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/dataSource.js';
import { User } from '../../config/entities/User.js';
import * as crypto from 'node:crypto';

/**
 * User Repository - TypeORM
 */
export class UserRepository {
  private repo: Repository<User>;

  constructor() {
    this.repo = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  async save(user: Partial<User>): Promise<User> {
    // Si viene password sin hash, hashearla
    if (user.passwordHash && !user.passwordHash.includes(':') && user.passwordHash.length < 64) {
      user.passwordHash = crypto.createHash('sha256').update(user.passwordHash).digest('hex');
    }
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repo.update(id, data);
    return this.findById(id) as Promise<User>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // Helper para hashear passwords
  hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }
}

/**
 * Auth Service - Application Layer
 */
export class AuthService {
  private repo: UserRepository;

  constructor() {
    this.repo = new UserRepository();
  }

  /**
   * Login - verifica email y password
   */
  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = await this.repo.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    // Verificar password con hash
    const hash = this.repo.hashPassword(password);
    if (user.passwordHash !== hash) {
      return null;
    }

    // Generar token simple (en producción usar JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    return { user, token };
  }

  /**
   * Verificar token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');
      return this.repo.findById(userId);
    } catch {
      return null;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getById(id: string): Promise<User | null> {
    return this.repo.findById(id);
  }
}