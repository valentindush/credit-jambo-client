import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Admin Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Transaction stats retrieved successfully' })
  async getTransactionStats(@Query('days') days?: number) {
    return this.analyticsService.getTransactionStats(days || 30);
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Get user growth statistics' })
  @ApiResponse({ status: 200, description: 'User growth stats retrieved successfully' })
  async getUserGrowth(@Query('days') days?: number) {
    return this.analyticsService.getUserGrowth(days || 30);
  }

  @Get('credit-performance')
  @ApiOperation({ summary: 'Get credit performance metrics' })
  @ApiResponse({ status: 200, description: 'Credit performance retrieved successfully' })
  async getCreditPerformance() {
    return this.analyticsService.getCreditPerformance();
  }

  @Get('savings')
  @ApiOperation({ summary: 'Get savings statistics' })
  @ApiResponse({ status: 200, description: 'Savings stats retrieved successfully' })
  async getSavingsStats() {
    return this.analyticsService.getSavingsStats();
  }
}

