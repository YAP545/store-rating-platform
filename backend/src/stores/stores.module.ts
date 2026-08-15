import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { StoreEntity } from '../database/entities/store.entity';
import { UserEntity } from '../database/entities/user.entity';
import { RatingEntity } from '../database/entities/rating.entity';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoreEntity, UserEntity, RatingEntity]),
    LogsModule,
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
