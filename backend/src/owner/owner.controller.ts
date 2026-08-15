import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.STORE_OWNER)
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get('dashboard')
  async getDashboard(@Req() req: any, @Query() query: any) {
    return this.ownerService.getDashboardData(req.user.id, query);
  }

  @Get('ratings')
  async getRatings(@Req() req: any, @Query() query: any) {
    return this.ownerService.getRatings(req.user.id, query);
  }

  @Get('export-ratings')
  async getExportRatings(@Req() req: any, @Query() query: any) {
    return this.ownerService.getExportRatings(req.user.id, query);
  }

  @Get('analytics')
  async getAnalytics(@Req() req: any) {
    return this.ownerService.getAnalytics(req.user.id);
  }
}
