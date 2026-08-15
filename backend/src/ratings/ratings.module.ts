import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { RatingEntity } from '../database/entities/rating.entity';
import { StoreEntity } from '../database/entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RatingEntity, StoreEntity])],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
