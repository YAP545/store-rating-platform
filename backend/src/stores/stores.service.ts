import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from '../database/entities/store.entity';
import { UserEntity } from '../database/entities/user.entity';
import { RatingEntity } from '../database/entities/rating.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreQueryDto } from './dto/store-query.dto';
import { Role } from '../common/enums/role.enum';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,
    private readonly logsService: LogsService,
  ) {}

  async createStore(createStoreDto: CreateStoreDto, currentAdminUser?: any) {
    let owner = null;

    if (createStoreDto.ownerId) {
      owner = await this.userRepository.findOne({
        where: { id: createStoreDto.ownerId },
      });

      if (!owner) {
        throw new NotFoundException(`User with ID ${createStoreDto.ownerId} not found`);
      }

      if (owner.role !== Role.STORE_OWNER) {
        throw new BadRequestException(
          `User with ID ${createStoreDto.ownerId} is not a STORE_OWNER`,
        );
      }
    }

    const store = this.storeRepository.create({
      name: createStoreDto.name,
      email: createStoreDto.email,
      address: createStoreDto.address,
      ownerId: createStoreDto.ownerId || null,
    });

    const savedStore = await this.storeRepository.save(store);

    if (currentAdminUser && currentAdminUser.id) {
      await this.logsService.createLog({
        userId: currentAdminUser.id,
        userName: currentAdminUser.name || 'System Admin',
        userEmail: currentAdminUser.email || 'admin@storerating.com',
        action: 'STORE_CREATED',
        module: 'STORES',
        description: `Registered new store: ${savedStore.name}`,
        status: 'SUCCESS',
      });
    }

    return savedStore;
  }

  async findAll(query: StoreQueryDto, currentUserId?: number) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.storeRepository
      .createQueryBuilder('store')
      .leftJoinAndSelect('store.owner', 'owner')
      .leftJoin('store.ratings', 'rating')
      .select([
        'store.id',
        'store.name',
        'store.email',
        'store.address',
        'store.ownerId',
        'store.createdAt',
        'store.updatedAt',
        'owner.id',
        'owner.name',
        'owner.email',
      ])
      .addSelect('COALESCE(AVG(rating.rating), 0)', 'overallRating')
      .addSelect('COUNT(rating.id)', 'totalRatings')
      .groupBy('store.id')
      .addGroupBy('owner.id');

    if (query.search) {
      qb.andWhere(
        '(store.name LIKE :search OR store.address LIKE :search OR store.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const allowedSortFields = ['name', 'email', 'address', 'createdAt'];
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    if (query.sortBy === 'rating') {
      qb.orderBy('overallRating', sortOrder);
    } else if (allowedSortFields.includes(query.sortBy)) {
      qb.orderBy(`store.${query.sortBy}`, sortOrder);
    } else {
      qb.orderBy('store.createdAt', 'DESC');
    }

    qb.offset(skip).limit(limit);

    const rawAndEntities = await qb.getRawAndEntities();
    const rawResults = rawAndEntities.raw;
    const entities = rawAndEntities.entities;

    let userRatingsMap = new Map<number, { id: number; rating: number; createdAt?: Date; updatedAt?: Date }>();
    if (currentUserId && entities.length > 0) {
      const storeIds = entities.map((e) => e.id);
      const userRatings = await this.ratingRepository
        .createQueryBuilder('rating')
        .where('rating.userId = :userId', { userId: currentUserId })
        .andWhere('rating.storeId IN (:...storeIds)', { storeIds })
        .getMany();

      userRatings.forEach((r) => {
        userRatingsMap.set(r.storeId, {
          id: r.id,
          rating: r.rating,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        });
      });
    }

    const data = entities.map((store, index) => {
      const raw = rawResults[index];
      const avg = parseFloat(raw?.overallRating || '0');
      const currentUserRating = userRatingsMap.get(store.id) || null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        owner: store.owner,
        overallRating: avg.toFixed(1),
        totalRatings: parseInt(raw?.totalRatings || '0', 10),
        userRating: currentUserRating,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      };
    });

    const totalCountQuery = this.storeRepository.createQueryBuilder('store');
    if (query.search) {
      totalCountQuery.where(
        '(store.name LIKE :search OR store.address LIKE :search OR store.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    const total = await totalCountQuery.getCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: number, currentUserId?: number) {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    const ratingStats = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.rating)', 'avgRating')
      .addSelect('COUNT(rating.id)', 'totalRatings')
      .where('rating.storeId = :storeId', { storeId: id })
      .getRawOne();

    let userRating = null;
    if (currentUserId) {
      const rating = await this.ratingRepository.findOne({
        where: { storeId: id, userId: currentUserId },
      });
      if (rating) {
        userRating = {
          id: rating.id,
          rating: rating.rating,
          createdAt: rating.createdAt,
          updatedAt: rating.updatedAt,
        };
      }
    }

    const avg = parseFloat(ratingStats?.avgRating || '0');

    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
      owner: store.owner,
      overallRating: avg.toFixed(1),
      totalRatings: parseInt(ratingStats?.totalRatings || '0', 10),
      userRating,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    };
  }

  async updateStore(id: number, updateStoreDto: UpdateStoreDto, currentUser: any) {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    if (currentUser.role === Role.STORE_OWNER) {
      if (store.ownerId !== currentUser.id) {
        throw new ForbiddenException('You can only edit stores that you own');
      }
    }

    if (updateStoreDto.name !== undefined) {
      if (!updateStoreDto.name.trim()) {
        throw new BadRequestException('Store name cannot be empty');
      }
      store.name = updateStoreDto.name.trim();
    }

    if (updateStoreDto.email !== undefined) {
      store.email = updateStoreDto.email.trim();
    }

    if (updateStoreDto.address !== undefined) {
      if (!updateStoreDto.address.trim()) {
        throw new BadRequestException('Store address cannot be empty');
      }
      store.address = updateStoreDto.address.trim();
    }

    const updatedStore = await this.storeRepository.save(store);

    if (currentUser && currentUser.id) {
      await this.logsService.createLog({
        userId: currentUser.id,
        userName: currentUser.name || 'User',
        userEmail: currentUser.email || 'user@example.com',
        action: 'STORE_UPDATED',
        module: 'STORES',
        description: `Updated store information: ${updatedStore.name}`,
        status: 'SUCCESS',
      });
    }

    return { message: 'Store updated successfully', store: updatedStore };
  }

  async updateOwner(id: number, ownerId: number | null, currentAdminUser?: any) {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    if (ownerId === null || ownerId === undefined) {
      store.ownerId = null;
      await this.storeRepository.save(store);

      if (currentAdminUser && currentAdminUser.id) {
        await this.logsService.createLog({
          userId: currentAdminUser.id,
          userName: currentAdminUser.name || 'System Admin',
          userEmail: currentAdminUser.email || 'admin@storerating.com',
          action: 'OWNER_REMOVED',
          module: 'STORES',
          description: `Removed owner assignment from store: ${store.name}`,
          status: 'SUCCESS',
        });
      }

      return { message: 'Store owner assignment removed successfully', store };
    }

    const newOwner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!newOwner) {
      throw new NotFoundException(`User with ID ${ownerId} not found`);
    }

    if (newOwner.role !== Role.STORE_OWNER) {
      throw new BadRequestException(`User with ID ${ownerId} is not a STORE_OWNER`);
    }

    store.ownerId = ownerId;
    await this.storeRepository.save(store);

    if (currentAdminUser && currentAdminUser.id) {
      await this.logsService.createLog({
        userId: currentAdminUser.id,
        userName: currentAdminUser.name || 'System Admin',
        userEmail: currentAdminUser.email || 'admin@storerating.com',
        action: 'OWNER_CHANGED',
        module: 'STORES',
        description: `Assigned store owner for ${store.name} to ${newOwner.name}`,
        status: 'SUCCESS',
      });
    }

    return { message: 'Store owner updated successfully', store };
  }

  async deleteStore(id: number, currentAdminUser?: any) {
    const store = await this.storeRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    // Safely delete ratings associated with this store to respect foreign keys
    await this.ratingRepository.delete({ storeId: id });

    // Remove store
    await this.storeRepository.remove(store);

    if (currentAdminUser && currentAdminUser.id) {
      await this.logsService.createLog({
        userId: currentAdminUser.id,
        userName: currentAdminUser.name || 'System Admin',
        userEmail: currentAdminUser.email || 'admin@storerating.com',
        action: 'STORE_DELETED',
        module: 'STORES',
        description: `Deleted store: ${store.name}`,
        status: 'SUCCESS',
      });
    }

    return { message: 'Store deleted successfully' };
  }
}
