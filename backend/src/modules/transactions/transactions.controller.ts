import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransactionType, TransactionStatus } from '@prisma/client';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions for current user' })
  @ApiQuery({ name: 'type', required: false, enum: TransactionType })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(
    @CurrentUser() user: any,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit?: number,
  ) {
    return this.transactionsService.getTransactions(user.id, {
      type,
      status,
      limit,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'] })
  @ApiResponse({ status: 200, description: 'Transaction stats retrieved successfully' })
  async getTransactionStats(
    @CurrentUser() user: any,
    @Query('period') period: 'week' | 'month' | 'year' = 'month',
  ) {
    return this.transactionsService.getTransactionStats(user.id, period);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get monthly transaction analytics' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getMonthlyAnalytics(
    @CurrentUser() user: any,
    @Query('months', new DefaultValuePipe(6), ParseIntPipe) months?: number,
  ) {
    return this.transactionsService.getMonthlyAnalytics(user.id, months);
  }

  @Get(':transactionId')
  @ApiOperation({ summary: 'Get specific transaction details' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(
    @CurrentUser() user: any,
    @Param('transactionId') transactionId: string,
  ) {
    return this.transactionsService.getTransaction(user.id, transactionId);
  }
}

