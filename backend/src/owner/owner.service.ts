import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from '../database/entities/store.entity';
import { RatingEntity } from '../database/entities/rating.entity';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,
  ) {}

  async getDashboardData(ownerId: number, query?: any) {
    const stores = await this.storeRepository.find({
      where: { ownerId },
    });

    if (stores.length === 0) {
      throw new NotFoundException('No store found registered under your Store Owner account');
    }

    const storeIds = stores.map((s) => s.id);

    const stats = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'avgRating')
      .addSelect('COUNT(rating.id)', 'totalRatings')
      .where('rating.storeId IN (:...storeIds)', { storeIds })
      .getRawOne();

    const avgRating = stats?.avgRating
      ? parseFloat(stats.avgRating).toFixed(1)
      : '0.0';
    const totalRatings = parseInt(stats?.totalRatings || '0', 10);

    const page = parseInt(query?.page || '1', 10);
    const limit = parseInt(query?.limit || '10', 10);
    const skip = (page - 1) * limit;

    const qb = this.ratingRepository
      .createQueryBuilder('rating')
      .innerJoinAndSelect('rating.user', 'user')
      .where('rating.storeId IN (:...storeIds)', { storeIds });

    if (query?.search) {
      qb.andWhere(
        '(user.name LIKE :search OR user.email LIKE :search OR user.address LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const sortBy = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    if (sortBy === 'name') {
      qb.orderBy('user.name', sortOrder);
    } else if (sortBy === 'email') {
      qb.orderBy('user.email', sortOrder);
    } else if (sortBy === 'rating') {
      qb.orderBy('rating.rating', sortOrder);
    } else {
      qb.orderBy('rating.createdAt', sortOrder);
    }

    qb.skip(skip).take(limit);

    const [ratings, total] = await qb.getManyAndCount();

    const ratingUsers = ratings.map((r) => ({
      ratingId: r.id,
      userName: r.user.name,
      userEmail: r.user.email,
      userAddress: r.user.address,
      rating: r.rating,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const storesList = await Promise.all(
      stores.map(async (s) => {
        const sStats = await this.ratingRepository
          .createQueryBuilder('rating')
          .select('AVG(rating.rating)', 'avgRating')
          .addSelect('COUNT(rating.id)', 'totalRatings')
          .where('rating.storeId = :storeId', { storeId: s.id })
          .getRawOne();

        const sAvg = sStats?.avgRating ? parseFloat(sStats.avgRating).toFixed(1) : '0.0';
        const sTotal = parseInt(sStats?.totalRatings || '0', 10);

        return {
          id: s.id,
          name: s.name,
          email: s.email,
          address: s.address,
          averageRating: sAvg,
          totalRatings: sTotal,
        };
      })
    );

    return {
      store: storesList[0],
      stores: storesList,
      storesCount: stores.length,
      overallAverageRating: avgRating,
      overallTotalRatings: totalRatings,
      ratingUsers: {
        data: ratingUsers,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    };
  }

  async getRatings(ownerId: number, query?: any) {
    const dashboardData = await this.getDashboardData(ownerId, query);
    return dashboardData.ratingUsers;
  }

  async getExportRatings(ownerId: number, query: { fromDate?: string; toDate?: string; storeId?: number }) {
    const stores = await this.storeRepository.find({ where: { ownerId } });
    if (stores.length === 0) {
      return {
        data: [],
        summary: {
          totalRatings: 0,
          averageRating: '0.00',
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }

    const storeIds = stores.map((s) => s.id);
    const storeNameMap = new Map<number, string>();
    stores.forEach((s) => storeNameMap.set(s.id, s.name));

    const qb = this.ratingRepository
      .createQueryBuilder('rating')
      .innerJoinAndSelect('rating.user', 'user')
      .where('rating.storeId IN (:...storeIds)', { storeIds });

    if (query.storeId) {
      qb.andWhere('rating.storeId = :storeId', { storeId: Number(query.storeId) });
    }

    if (query.fromDate) {
      qb.andWhere('rating.createdAt >= :fromDate', { fromDate: new Date(query.fromDate) });
    }

    if (query.toDate) {
      const to = new Date(query.toDate);
      to.setHours(23, 59, 59, 999);
      qb.andWhere('rating.createdAt <= :toDate', { toDate: to });
    }

    qb.orderBy('rating.createdAt', 'DESC');

    const ratings = await qb.getMany();

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    const data = ratings.map((r) => {
      const val = Number(r.rating);
      if (val >= 1 && val <= 5) {
        distribution[val]++;
        sum += val;
      }
      return {
        ratingId: r.id,
        storeId: r.storeId,
        storeName: storeNameMap.get(r.storeId) || 'Store #' + r.storeId,
        rating: r.rating,
        userName: r.user?.name || 'Verified Customer',
        userEmail: r.user?.email || 'N/A',
        createdAt: r.createdAt,
      };
    });

    const totalRatings = data.length;
    const averageRating = totalRatings > 0 ? (sum / totalRatings).toFixed(2) : '0.00';

    return {
      data,
      summary: {
        totalRatings,
        averageRating,
        distribution,
      },
    };
  }

  async getAnalytics(ownerId: number) {
    const stores = await this.storeRepository.find({ where: { ownerId } });
    if (stores.length === 0) {
      return {
        storesCount: 0,
        storeComparison: [],
        monthlyComparison: { hasHistoricalData: false, message: 'Not enough historical data for comparison.' },
      };
    }

    const storeIds = stores.map((s) => s.id);

    // 1. Per-Store Performance Comparison
    const storeComparison = await Promise.all(
      stores.map(async (s) => {
        const stats = await this.ratingRepository
          .createQueryBuilder('rating')
          .select('AVG(rating.rating)', 'avgRating')
          .addSelect('COUNT(rating.id)', 'totalRatings')
          .where('rating.storeId = :storeId', { storeId: s.id })
          .getRawOne();

        const ratings = await this.ratingRepository.find({ where: { storeId: s.id } });
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        ratings.forEach((r) => {
          const val = Number(r.rating);
          if (val >= 1 && val <= 5) distribution[val]++;
        });

        const total = ratings.length;
        const pcts = {
          5: total > 0 ? Math.round((distribution[5] / total) * 100) : 0,
          4: total > 0 ? Math.round((distribution[4] / total) * 100) : 0,
          3: total > 0 ? Math.round((distribution[3] / total) * 100) : 0,
          2: total > 0 ? Math.round((distribution[2] / total) * 100) : 0,
          1: total > 0 ? Math.round((distribution[1] / total) * 100) : 0,
        };

        return {
          id: s.id,
          name: s.name,
          email: s.email,
          address: s.address,
          averageRating: stats?.avgRating ? parseFloat(stats.avgRating).toFixed(2) : '0.00',
          totalRatings: total,
          distribution,
          percentages: pcts,
        };
      })
    );

    // 2. Month-to-Month Performance Comparison
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const currentMonthRatings = await this.ratingRepository
      .createQueryBuilder('rating')
      .where('rating.storeId IN (:...storeIds)', { storeIds })
      .andWhere('rating.createdAt >= :start', { start: currentMonthStart })
      .getMany();

    const previousMonthRatings = await this.ratingRepository
      .createQueryBuilder('rating')
      .where('rating.storeId IN (:...storeIds)', { storeIds })
      .andWhere('rating.createdAt >= :start AND rating.createdAt <= :end', {
        start: previousMonthStart,
        end: previousMonthEnd,
      })
      .getMany();

    const calculatePeriodStats = (ratingsList: RatingEntity[]) => {
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sum = 0;
      ratingsList.forEach((r) => {
        const val = Number(r.rating);
        if (val >= 1 && val <= 5) {
          dist[val]++;
          sum += val;
        }
      });
      const count = ratingsList.length;
      const avg = count > 0 ? sum / count : 0;
      return { count, avg, dist };
    };

    const currentStats = calculatePeriodStats(currentMonthRatings);
    const previousStats = calculatePeriodStats(previousMonthRatings);

    const currentMonthName = now.toLocaleString('default', { month: 'long' });
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthName = prevDate.toLocaleString('default', { month: 'long' });

    let monthlyComparison = null;
    if (previousStats.count === 0 && currentStats.count === 0) {
      monthlyComparison = {
        hasHistoricalData: false,
        message: 'Not enough historical data for comparison.',
      };
    } else {
      const countDiff = currentStats.count - previousStats.count;
      const ratingDiff = parseFloat((currentStats.avg - previousStats.avg).toFixed(2));

      monthlyComparison = {
        hasHistoricalData: true,
        currentMonth: {
          name: currentMonthName,
          count: currentStats.count,
          avg: currentStats.avg.toFixed(2),
          distribution: currentStats.dist,
        },
        previousMonth: {
          name: previousMonthName,
          count: previousStats.count,
          avg: previousStats.avg.toFixed(2),
          distribution: previousStats.dist,
        },
        difference: {
          countDiff,
          ratingDiff,
          improved: ratingDiff > 0 || (ratingDiff === 0 && countDiff > 0),
          unchanged: ratingDiff === 0 && countDiff === 0,
          declined: ratingDiff < 0,
        },
      };
    }

    return {
      storesCount: stores.length,
      storeComparison,
      monthlyComparison,
    };
  }
}
