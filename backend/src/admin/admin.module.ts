import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UserEntity } from '../database/entities/user.entity';
import { StoreEntity } from '../database/entities/store.entity';
import { RatingEntity } from '../database/entities/rating.entity';
import { UsersModule } from '../users/users.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, StoreEntity, RatingEntity]),
    UsersModule,
    StoresModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
