import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { StoreEntity } from '../database/entities/store.entity';
import { RatingEntity } from '../database/entities/rating.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreEntity, RatingEntity])],
  controllers: [OwnerController],
  providers: [OwnerService],
})
export class OwnerModule {}
