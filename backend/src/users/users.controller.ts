import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.SYSTEM_ADMIN)
  async create(@Req() req: any, @Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto, req.user);
  }

  @Get()
  @Roles(Role.SYSTEM_ADMIN)
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SYSTEM_ADMIN)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.SYSTEM_ADMIN)
  async deleteUser(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id, req.user);
  }
}
