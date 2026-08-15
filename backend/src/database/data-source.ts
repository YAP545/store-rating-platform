import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { StoreEntity } from './entities/store.entity';
import { RatingEntity } from './entities/rating.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Robustly load .env from backend directory or current working directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'store_rating_db',
  entities: [UserEntity, StoreEntity, RatingEntity, AuditLogEntity],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  synchronize: false,
  logging: false,
});
