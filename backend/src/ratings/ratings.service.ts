import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RatingEntity } from '../database/entities/rating.entity';
import { StoreEntity } from '../database/entities/store.entity';

import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,

    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
  ) {}

  // ==========================================
  // SUBMIT RATING
  // ==========================================

  async submitRating(
    userId: number,
    createRatingDto: CreateRatingDto,
  ) {
    const store = await this.storeRepository.findOne({
      where: {
        id: createRatingDto.storeId,
      },
    });

    if (!store) {
      throw new NotFoundException(
        `Store with ID ${createRatingDto.storeId} not found`,
      );
    }

    const existingRating =
      await this.ratingRepository.findOne({
        where: {
          userId,
          storeId: createRatingDto.storeId,
        },
      });

    if (existingRating) {
      throw new ConflictException(
        'You have already submitted a rating for this store. You can modify your existing rating instead.',
      );
    }

    const newRating =
      this.ratingRepository.create({
        userId,
        storeId: createRatingDto.storeId,
        rating: createRatingDto.rating,
      });

    return await this.ratingRepository.save(
      newRating,
    );
  }

  // ==========================================
  // MODIFY RATING
  // ==========================================

  async modifyRating(
    userId: number,
    id: number,
    updateRatingDto: UpdateRatingDto,
  ) {
    const rating =
      await this.ratingRepository.findOne({
        where: {
          id,
        },
      });

    if (!rating) {
      throw new NotFoundException(
        `Rating record with ID ${id} not found`,
      );
    }

    if (rating.userId !== userId) {
      throw new ForbiddenException(
        'You can only modify ratings submitted by yourself',
      );
    }

    rating.rating = updateRatingDto.rating;

    return await this.ratingRepository.save(
      rating,
    );
  }

  // ==========================================
  // GET ALL RATINGS - ADMIN
  // ==========================================

  async getAllRatings() {
    const ratings =
      await this.ratingRepository.find({
        relations: ['user'],
        order: {
          createdAt: 'DESC',
        },
      });

    const totalRatings = ratings.length;

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratings.forEach((item) => {
      const value = Number(item.rating);

      if (value >= 1 && value <= 5) {
        ratingDistribution[value]++;
      }
    });

    return {
      data: ratings,

      meta: {
        total: totalRatings,

        distribution: ratingDistribution,
      },
    };
  }

  // ==========================================
  // GET RATINGS FOR ONE STORE
  // ==========================================

  async getStoreRatings(storeId: number) {
    const store =
      await this.storeRepository.findOne({
        where: {
          id: storeId,
        },
      });

    if (!store) {
      throw new NotFoundException(
        `Store with ID ${storeId} not found`,
      );
    }

    return await this.ratingRepository.find({
      where: {
        storeId,
      },

      relations: ['user'],

      order: {
        createdAt: 'DESC',
      },
    });
  }
}