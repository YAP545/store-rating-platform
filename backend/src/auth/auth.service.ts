import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../common/enums/role.enum';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly logsService: LogsService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) {
      await this.logsService.createLog({
        userId: null,
        userName: registerDto.name,
        userEmail: registerDto.email,
        action: 'REGISTER',
        module: 'AUTH',
        description: 'Failed registration: Email address already registered',
        status: 'FAILED',
      });
      throw new ConflictException('An account with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: Role.NORMAL_USER,
    });

    await this.userRepository.save(user);

    await this.logsService.createLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'USER_CREATED',
      module: 'USERS',
      description: `New normal user registered: ${user.name}`,
      status: 'SUCCESS',
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Registration successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: loginDto.email })
      .getOne();

    if (!user) {
      await this.logsService.createLog({
        userId: null,
        userName: 'Unknown Guest',
        userEmail: loginDto.email,
        action: 'LOGIN',
        module: 'AUTH',
        description: 'Failed login attempt with non-existent user email',
        status: 'FAILED',
      });
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      await this.logsService.createLog({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: 'LOGIN',
        module: 'AUTH',
        description: 'Failed login attempt with incorrect password',
        status: 'FAILED',
      });
      throw new UnauthorizedException('Invalid email or password credentials');
    }

    await this.logsService.createLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'LOGIN',
      module: 'AUTH',
      description: `User logged in successfully as ${user.role}`,
      status: 'SUCCESS',
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('User profile not found');
    }

    const isMatch = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );
    if (!isMatch) {
      await this.logsService.createLog({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action: 'PASSWORD_CHANGE',
        module: 'SETTINGS',
        description: 'Failed password update: Incorrect current password provided',
        status: 'FAILED',
      });
      throw new BadRequestException('Current password does not match');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    await this.logsService.createLog({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      action: 'PASSWORD_CHANGE',
      module: 'SETTINGS',
      description: 'Account security password changed successfully',
      status: 'SUCCESS',
    });

    return { message: 'Password updated successfully' };
  }
}
