import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';
import { UserQueryDto } from '../users/dto/user-query.dto';
import { StoreQueryDto } from '../stores/dto/store-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SYSTEM_ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  async getUsers(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Delete('users/:id')
  async deleteUser(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id, req.user);
  }

  @Get('stores')
  async getStores(@Query() query: StoreQueryDto) {
    return this.storesService.findAll(query);
  }

  @Delete('stores/:id/owner')
  async removeStoreOwner(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.storesService.updateOwner(id, null, req.user);
  }

  @Delete('stores/:id')
  async deleteStore(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.storesService.deleteStore(id, req.user);
  }
}
