import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreQueryDto } from './dto/store-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Roles(Role.SYSTEM_ADMIN)
  async create(@Req() req: any, @Body() createStoreDto: CreateStoreDto) {
    return this.storesService.createStore(createStoreDto, req.user);
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: StoreQueryDto) {
    return this.storesService.findAll(query, req.user?.id);
  }

  @Get(':id')
  async findOne(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.storesService.findOne(id, req.user?.id);
  }

  @Put(':id')
  @Roles(Role.STORE_OWNER, Role.SYSTEM_ADMIN)
  async updateStore(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.updateStore(id, updateStoreDto, req.user);
  }

  @Put(':id/owner')
  @Roles(Role.SYSTEM_ADMIN)
  async updateOwner(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('ownerId') ownerId: number | null,
  ) {
    return this.storesService.updateOwner(id, ownerId, req.user);
  }

  @Delete(':id/owner')
  @Roles(Role.SYSTEM_ADMIN)
  async removeOwner(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.storesService.updateOwner(id, null, req.user);
  }

  @Delete(':id')
  @Roles(Role.SYSTEM_ADMIN)
  async deleteStore(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.storesService.deleteStore(id, req.user);
  }
}
