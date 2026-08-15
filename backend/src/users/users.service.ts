import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../database/entities/user.entity';
import { StoreEntity } from '../database/entities/store.entity';
import { RatingEntity } from '../database/entities/rating.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Role } from '../common/enums/role.enum';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(RatingEntity)
    private readonly ratingRepository: Repository<RatingEntity>,
    private readonly logsService: LogsService,
  ) {}

  async createUser(createUserDto: CreateUserDto, currentAdmin?: any) {
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    if (currentAdmin && currentAdmin.id) {
      await this.logsService.createLog({
        userId: currentAdmin.id,
        userName: currentAdmin.name || 'System Admin',
        userEmail: currentAdmin.email || 'admin@storerating.com',
        action: 'USER_CREATED',
        module: 'USERS',
        description: `Created new ${user.role} user account: ${user.name}`,
        status: 'SUCCESS',
      });
    }

    const { password, ...result } = user;
    return result;
  }

  async findAll(query: UserQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.userRepository.createQueryBuilder('user');

    if (query.role) {
      qb.andWhere('user.role = :role', { role: query.role });
    }

    if (query.search) {
      qb.andWhere(
        '(user.name LIKE :search OR user.email LIKE :search OR user.address LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortBy = allowedSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    qb.orderBy(`user.${sortBy}`, sortOrder);
    qb.skip(skip).take(limit);

    const [users, total] = await qb.getManyAndCount();

    const formattedUsers = await Promise.all(
      users.map(async (u) => {
        let storeRating = null;
        let storesList = [];
        if (u.role === Role.STORE_OWNER) {
          const stores = await this.storeRepository.find({
            where: { ownerId: u.id },
          });
          storesList = stores.map((s) => ({ id: s.id, name: s.name }));

          if (stores.length > 0) {
            const store = stores[0];
            const avgResult = await this.ratingRepository
              .createQueryBuilder('rating')
              .select('AVG(rating.rating)', 'avgRating')
              .addSelect('COUNT(rating.id)', 'totalRatings')
              .where('rating.storeId = :storeId', { storeId: store.id })
              .getRawOne();

            storeRating = {
              storeId: store.id,
              storeName: store.name,
              averageRating: avgResult?.avgRating ? parseFloat(avgResult.avgRating).toFixed(1) : '0.0',
              totalRatings: parseInt(avgResult?.totalRatings || '0', 10),
            };
          }
        }
        return {
          ...u,
          stores: storesList,
          storeRating,
        };
      }),
    );

    return {
      data: formattedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    let storeRating = null;
    let storesList = [];
    if (user.role === Role.STORE_OWNER) {
      const stores = await this.storeRepository.find({
        where: { ownerId: user.id },
      });
      storesList = stores.map((s) => ({ id: s.id, name: s.name }));

      if (stores.length > 0) {
        const store = stores[0];
        const avgResult = await this.ratingRepository
          .createQueryBuilder('rating')
          .select('AVG(rating.rating)', 'avgRating')
          .addSelect('COUNT(rating.id)', 'totalRatings')
          .where('rating.storeId = :storeId', { storeId: store.id })
          .getRawOne();

        storeRating = {
          storeId: store.id,
          storeName: store.name,
          storeAddress: store.address,
          storeEmail: store.email,
          averageRating: avgResult?.avgRating ? parseFloat(avgResult.avgRating).toFixed(1) : '0.0',
          totalRatings: parseInt(avgResult?.totalRatings || '0', 10),
        };
      }
    }

    return {
      ...user,
      stores: storesList,
      storeRating,
    };
  }

  async deleteUser(id: number, currentAdminUser: any) {
    if (currentAdminUser && currentAdminUser.id === id) {
      throw new BadRequestException('You cannot delete the currently logged-in administrator.');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.role === Role.STORE_OWNER) {
      const assignedStores = await this.storeRepository.find({
        where: { ownerId: id },
      });

      if (assignedStores && assignedStores.length > 0) {
        throw new BadRequestException(
          `Cannot remove this store owner because they currently manage ${assignedStores.length} store${
            assignedStores.length > 1 ? 's' : ''
          }. Reassign the stores before deleting the owner.`
        );
      }
    }

    // Safely delete rating entries submitted by this user to preserve referential integrity
    await this.ratingRepository.delete({ userId: id });

    // Remove user account
    await this.userRepository.remove(user);

    // Write audit log entry with performing admin's numeric user ID
    if (currentAdminUser && currentAdminUser.id) {
      await this.logsService.createLog({
        userId: currentAdminUser.id,
        userName: currentAdminUser.name || 'System Admin',
        userEmail: currentAdminUser.email || 'admin@storerating.com',
        action: 'USER_DELETED',
        module: 'USERS',
        description: `Removed user account: ${user.name} (${user.email})`,
        status: 'SUCCESS',
      });
    }

    return { message: 'User deleted successfully' };
  }
}
