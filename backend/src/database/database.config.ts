import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { StoreEntity } from './entities/store.entity';
import { RatingEntity } from './entities/rating.entity';
import { AuditLogEntity } from './entities/audit-log.entity';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_DATABASE || 'store_rating_db',
  entities: [UserEntity, StoreEntity, RatingEntity, AuditLogEntity],
  synchronize: false,
  logging: false,
});
