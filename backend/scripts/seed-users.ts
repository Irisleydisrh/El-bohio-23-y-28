import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../src/config/dataSource.js';
import { User } from '../src/config/entities/User.js';

async function createTestUsers() {
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const userRepo = AppDataSource.getRepository(User);

  // Users to create
  const users = [
    {
      email: 'cajero@elbohio.com',
      password: 'cajero123',
      firstName: 'Ana',
      rol: 'CAJERO'
    },
    {
      email: 'mesero@elbohio.com',
      password: 'mesero123',
      firstName: 'Carlos',
      rol: 'MESERO'
    },
    {
      email: 'admin@elbohio.com',
      password: 'admin123',
      firstName: 'Admin',
      rol: 'ADMIN'
    }
  ];

  for (const userData of users) {
    // Check if user exists
    const existing = await userRepo.findOne({ where: { email: userData.email } });
    
    if (existing) {
      console.log(`⚠️  Usuario ${userData.email} ya existe, actualizando...`);
      existing.passwordHash = await bcrypt.hash(userData.password, 10);
      existing.firstName = userData.firstName;
      existing.rol = userData.rol;
      existing.isActive = true;
      await userRepo.save(existing);
      console.log(`✅ Actualizado: ${userData.email} (${userData.rol}) - Pass: ${userData.password}`);
    } else {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = userRepo.create({
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        rol: userData.rol,
        isActive: true
      });
      await userRepo.save(user);
      console.log(`✅ Creado: ${userData.email} (${userData.rol}) - Pass: ${userData.password}`);
    }
  }

  console.log('\n🎉 Usuarios de prueba creados correctamente!');
  console.log('\n📋 Credenciales:');
  console.log('   Cajero: cajero@elbohio.com / cajero123');
  console.log('   Mesero: mesero@elbohio.com / mesero123');
  console.log('   Admin:  admin@elbohio.com / admin123');

  await AppDataSource.destroy();
}

createTestUsers().catch(console.error);