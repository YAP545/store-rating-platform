import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../database/entities/user.entity';
import { StoreEntity } from '../database/entities/store.entity';
import { RatingEntity } from '../database/entities/rating.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,
  ) {}

  async getDashboardStats() {
    const totalUsers = await this.userRepository.count();
    const totalStores = await this.storeRepository.count();
    const totalRatings = await this.ratingRepository.count();
    const totalOwners = await this.userRepository.count({ where: { role: Role.STORE_OWNER } });

    // Platform-wide average rating
    const avgResult = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'avgRating')
      .getRawOne();
    const platformAverageRating = avgResult?.avgRating ? parseFloat(avgResult.avgRating).toFixed(2) : '0.00';

    // Store level statistics for Health Insights
    const storeStats = await this.storeRepository
      .createQueryBuilder('store')
      .leftJoin('store.ratings', 'rating')
      .select(['store.id AS id', 'store.name AS name'])
      .addSelect('COALESCE(AVG(rating.rating), 0)', 'overallRating')
      .addSelect('COUNT(rating.id)', 'totalRatings')
      .groupBy('store.id')
      .getRawMany();

    let storesWithNoRatings = 0;
    let storesBelowThreeStars = 0;
    let topPerformer = null;

    if (storeStats.length > 0) {
      storeStats.forEach((s) => {
        const count = parseInt(s.totalRatings || '0', 10);
        const avg = parseFloat(s.overallRating || '0');

        if (count === 0) {
          storesWithNoRatings++;
        } else if (avg < 3.0) {
          storesBelowThreeStars++;
        }
      });

      // Find top performer with highest rating & ratings count > 0
      const ratedStores = storeStats.filter((s) => parseInt(s.totalRatings || '0', 10) > 0);
      if (ratedStores.length > 0) {
        ratedStores.sort((a, b) => {
          const avgA = parseFloat(a.overallRating || '0');
          const avgB = parseFloat(b.overallRating || '0');
          if (avgB !== avgA) return avgB - avgA;
          return parseInt(b.totalRatings || '0', 10) - parseInt(a.totalRatings || '0', 10);
        });

        const top = ratedStores[0];
        topPerformer = {
          name: top.name,
          overallRating: parseFloat(top.overallRating).toFixed(2),
          totalRatings: parseInt(top.totalRatings, 10),
        };
      }
    }

    return {
      totalUsers,
      totalStores,
      totalRatings,
      totalOwners,
      platformAverageRating,
      health: {
        storesWithNoRatings,
        storesBelowThreeStars,
        topPerformer,
      },
    };
  }
}
