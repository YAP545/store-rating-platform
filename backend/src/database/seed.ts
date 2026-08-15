import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables before initializing AppDataSource
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

import { AppDataSource } from './data-source';
import { UserEntity } from './entities/user.entity';
import { StoreEntity } from './entities/store.entity';
import { RatingEntity } from './entities/rating.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { Role } from '../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting Database Seeding...');
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(UserEntity);
  const storeRepo = AppDataSource.getRepository(StoreEntity);
  const ratingRepo = AppDataSource.getRepository(RatingEntity);
  const logRepo = AppDataSource.getRepository(AuditLogEntity);

  // 0. Ensure audit_logs table exists if migration was not run prior
  await logRepo.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NULL,
      userName VARCHAR(255) NULL,
      userEmail VARCHAR(255) NULL,
      action VARCHAR(100) NOT NULL,
      module VARCHAR(100) NOT NULL,
      description VARCHAR(500) NOT NULL,
      ipAddress VARCHAR(100) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
      createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      INDEX idx_audit_logs_action (action),
      INDEX idx_audit_logs_module (module),
      INDEX idx_audit_logs_status (status),
      INDEX idx_audit_logs_createdAt (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const adminPasswordHash = await bcrypt.hash('Admin@1234', 10);
  const ownerPasswordHash = await bcrypt.hash('Owner@1234', 10);
  const userPasswordHash = await bcrypt.hash('User@1234', 10);

  // Helper function to safely get or create/update a user account with valid password hash
  const getOrCreateUser = async (userPayload: {
    name: string;
    email: string;
    passwordHash: string;
    address: string;
    role: Role;
  }) => {
    let user = await userRepo.findOne({ where: { email: userPayload.email } });
    if (!user) {
      user = userRepo.create({
        name: userPayload.name,
        email: userPayload.email,
        password: userPayload.passwordHash,
        address: userPayload.address,
        role: userPayload.role,
      });
      await userRepo.save(user);
      console.log(`+ Created user: ${user.email} (${user.role})`);
    } else {
      // Ensure password hash and role match expected demo credentials
      user.password = userPayload.passwordHash;
      user.role = userPayload.role;
      await userRepo.save(user);
      console.log(`✓ Updated credentials for user: ${user.email} (${user.role})`);
    }
    return user;
  };

  // 1. Seed System Admin Accounts
  const adminDemo = await getOrCreateUser({
    name: 'System Administrator Account',
    email: 'admin@demo.com',
    passwordHash: adminPasswordHash,
    address: '100 HQ Boulevard, Suite 500, Enterprise City, NY 10001',
    role: Role.SYSTEM_ADMIN,
  });

  await getOrCreateUser({
    name: 'System Administrator Account',
    email: 'admin@storerating.com',
    passwordHash: adminPasswordHash,
    address: '100 HQ Boulevard, Suite 500, Enterprise City, NY 10001',
    role: Role.SYSTEM_ADMIN,
  });

  // 2. Seed Store Owners
  const owner1 = await getOrCreateUser({
    name: 'Robert Vance Store Owner One',
    email: 'owner1@demo.com',
    passwordHash: ownerPasswordHash,
    address: '45 Tech Plaza, Silicon Valley, San Francisco, CA 94107',
    role: Role.STORE_OWNER,
  });

  const owner2 = await getOrCreateUser({
    name: 'Eleanor Vance Store Owner Two',
    email: 'owner2@demo.com',
    passwordHash: ownerPasswordHash,
    address: '88 Green Avenue, Eco Gardens, Portland, OR 97201',
    role: Role.STORE_OWNER,
  });

  await getOrCreateUser({
    name: 'Robert Vance Store Owner One',
    email: 'owner1@storerating.com',
    passwordHash: ownerPasswordHash,
    address: '45 Tech Plaza, Silicon Valley, San Francisco, CA 94107',
    role: Role.STORE_OWNER,
  });

  await getOrCreateUser({
    name: 'Eleanor Vance Store Owner Two',
    email: 'owner2@storerating.com',
    passwordHash: ownerPasswordHash,
    address: '88 Green Avenue, Eco Gardens, Portland, OR 97201',
    role: Role.STORE_OWNER,
  });

  // 3. Seed Normal Users
  const user1 = await getOrCreateUser({
    name: 'Alice Johnson Normal User One',
    email: 'user1@demo.com',
    passwordHash: userPasswordHash,
    address: '202 Maple Avenue, Apartment 4B, Springfield, IL 62701',
    role: Role.NORMAL_USER,
  });

  const user2 = await getOrCreateUser({
    name: 'Bob Smith Normal Customer Two',
    email: 'user2@demo.com',
    passwordHash: userPasswordHash,
    address: '505 Oak Street, Downtown District, Austin, TX 78701',
    role: Role.NORMAL_USER,
  });

  const user3 = await getOrCreateUser({
    name: 'Carol White Registered Consumer Three',
    email: 'user3@demo.com',
    passwordHash: userPasswordHash,
    address: '707 Pine Road, West End Quarter, Seattle, WA 98101',
    role: Role.NORMAL_USER,
  });

  await getOrCreateUser({
    name: 'Alice Johnson Normal User One',
    email: 'user1@storerating.com',
    passwordHash: userPasswordHash,
    address: '202 Maple Avenue, Apartment 4B, Springfield, IL 62701',
    role: Role.NORMAL_USER,
  });

  await getOrCreateUser({
    name: 'Bob Smith Normal Customer Two',
    email: 'user2@storerating.com',
    passwordHash: userPasswordHash,
    address: '505 Oak Street, Downtown District, Austin, TX 78701',
    role: Role.NORMAL_USER,
  });

  // Helper function to safely get or create a demo store
  const getOrCreateStore = async (storePayload: {
    name: string;
    email: string;
    address: string;
    ownerId: number;
  }) => {
    let store = await storeRepo.findOne({ where: { name: storePayload.name } });
    if (!store) {
      store = storeRepo.create(storePayload);
      await storeRepo.save(store);
      console.log(`+ Created store: ${store.name}`);
    } else {
      store.ownerId = storePayload.ownerId;
      await storeRepo.save(store);
      console.log(`✓ Store already exists: ${store.name}`);
    }
    return store;
  };

  // 4. Seed Realistic Stores
  const store1 = await getOrCreateStore({
    name: 'TechWorld Electronics Hub',
    email: 'contact@techworld.com',
    address: '45 Tech Plaza, Silicon Valley, San Francisco, CA 94107',
    ownerId: owner1.id,
  });

  const store2 = await getOrCreateStore({
    name: 'Organic Supermarket & Fresh Market',
    email: 'hello@organicsupermarket.com',
    address: '88 Green Avenue, Eco Gardens, Portland, OR 97201',
    ownerId: owner2.id,
  });

  const store3 = await getOrCreateStore({
    name: 'BookHaven International Bookstore',
    email: 'support@bookhaven.com',
    address: '12 Library Street, Culture Quarter, Boston, MA 02108',
    ownerId: owner1.id,
  });

  // Helper function to safely get or create ratings
  const getOrCreateRating = async (userId: number, storeId: number, ratingVal: number) => {
    let rating = await ratingRepo.findOne({ where: { userId, storeId } });
    if (!rating) {
      rating = ratingRepo.create({ userId, storeId, rating: ratingVal });
      await ratingRepo.save(rating);
      console.log(`+ Created rating: User #${userId} -> Store #${storeId} (${ratingVal}★)`);
    } else {
      rating.rating = ratingVal;
      await ratingRepo.save(rating);
      console.log(`✓ Updated rating for User #${userId} -> Store #${storeId}`);
    }
    return rating;
  };

  // 5. Seed Ratings
  await getOrCreateRating(user1.id, store1.id, 5);
  await getOrCreateRating(user2.id, store1.id, 4);
  await getOrCreateRating(user3.id, store1.id, 5);

  await getOrCreateRating(user1.id, store2.id, 4);
  await getOrCreateRating(user2.id, store2.id, 3);

  await getOrCreateRating(user2.id, store3.id, 5);
  await getOrCreateRating(user3.id, store3.id, 4);

  // 6. Seed Initial Audit Log if empty
  const logCount = await logRepo.count();
  if (logCount === 0) {
    const auditLogs = [
      logRepo.create({
        userId: adminDemo.id,
        userName: adminDemo.name,
        userEmail: adminDemo.email,
        action: 'SYSTEM_INIT',
        module: 'SYSTEM',
        description: 'System database initialized and seeded successfully',
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
      }),
      logRepo.create({
        userId: adminDemo.id,
        userName: adminDemo.name,
        userEmail: adminDemo.email,
        action: 'STORE_CREATED',
        module: 'STORES',
        description: 'Registered demo store: TechWorld Electronics Hub',
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
      }),
    ];
    await logRepo.save(auditLogs);
    console.log('+ Created initial audit logs');
  }

  console.log('\n✅ Seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('SYSTEM ADMIN:  admin@demo.com  / Admin@1234');
  console.log('STORE OWNER 1: owner1@demo.com / Owner@1234');
  console.log('STORE OWNER 2: owner2@demo.com / Owner@1234');
  console.log('NORMAL USER 1: user1@demo.com  / User@1234');
  console.log('NORMAL USER 2: user2@demo.com  / User@1234');
  console.log('NORMAL USER 3: user3@demo.com  / User@1234');
  console.log('----------------------------------------------------');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
