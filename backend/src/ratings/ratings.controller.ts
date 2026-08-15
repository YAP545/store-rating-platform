import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';

import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RatingsController {
  constructor(
    private readonly ratingsService: RatingsService,
  ) {}

  // ==========================================
  // SUBMIT RATING
  // ==========================================

  @Post()
  @Roles(Role.NORMAL_USER)
  async submitRating(
    @Req() req: any,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.submitRating(
      req.user.id,
      createRatingDto,
    );
  }

  // ==========================================
  // MODIFY RATING
  // ==========================================

  @Put(':id')
  @Roles(Role.NORMAL_USER)
  async modifyRating(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
  ) {
    return this.ratingsService.modifyRating(
      req.user.id,
      id,
      updateRatingDto,
    );
  }

  // ==========================================
  // GET ALL RATINGS - ADMIN
  // ==========================================

  @Get('admin/all')
  @Roles(Role.SYSTEM_ADMIN)
  async getAllRatings() {
    return this.ratingsService.getAllRatings();
  }

  // ==========================================
  // GET RATINGS FOR ONE STORE
  // ==========================================

  @Get('store/:storeId')
  async getStoreRatings(
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    return this.ratingsService.getStoreRatings(storeId);
  }
}