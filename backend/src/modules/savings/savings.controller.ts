import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SavingsService } from './savings.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Savings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('savings')
export class SavingsController {
  constructor(private readonly savingsService: SavingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all savings accounts for current user' })
  @ApiResponse({ status: 200, description: 'Savings accounts retrieved successfully' })
  async getSavingsAccounts(@CurrentUser() user: any) {
    return this.savingsService.getSavingsAccounts(user.id);
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get specific savings account details' })
  @ApiResponse({ status: 200, description: 'Savings account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Savings account not found' })
  async getSavingsAccount(
    @CurrentUser() user: any,
    @Param('accountId') accountId: string,
  ) {
    return this.savingsService.getSavingsAccount(user.id, accountId);
  }

  @Post(':accountId/deposit')
  @ApiOperation({ summary: 'Deposit money into savings account' })
  @ApiResponse({ status: 201, description: 'Deposit successful' })
  @ApiResponse({ status: 404, description: 'Savings account not found' })
  async deposit(
    @CurrentUser() user: any,
    @Param('accountId') accountId: string,
    @Body() depositDto: DepositDto,
  ) {
    return this.savingsService.deposit(user.id, accountId, depositDto);
  }

  @Post(':accountId/withdraw')
  @ApiOperation({ summary: 'Withdraw money from savings account' })
  @ApiResponse({ status: 201, description: 'Withdrawal successful' })
  @ApiResponse({ status: 400, description: 'Insufficient balance' })
  @ApiResponse({ status: 404, description: 'Savings account not found' })
  async withdraw(
    @CurrentUser() user: any,
    @Param('accountId') accountId: string,
    @Body() withdrawDto: WithdrawDto,
  ) {
    return this.savingsService.withdraw(user.id, accountId, withdrawDto);
  }

  @Get(':accountId/balance')
  @ApiOperation({ summary: 'Get savings account balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Savings account not found' })
  async getBalance(
    @CurrentUser() user: any,
    @Param('accountId') accountId: string,
  ) {
    return this.savingsService.getBalance(user.id, accountId);
  }

  @Get(':accountId/transactions')
  @ApiOperation({ summary: 'Get transaction history for savings account' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved successfully' })
  async getTransactionHistory(
    @CurrentUser() user: any,
    @Param('accountId') accountId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.savingsService.getTransactionHistory(user.id, accountId, limit);
  }
}

