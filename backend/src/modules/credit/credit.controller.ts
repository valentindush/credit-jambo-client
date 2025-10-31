import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { RequestCreditDto } from './dto/request-credit.dto';
import { RepayCreditDto } from './dto/repay-credit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Credit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request a new credit' })
  @ApiResponse({ status: 201, description: 'Credit request submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or pending credit exists' })
  async requestCredit(
    @CurrentUser() user: any,
    @Body() requestCreditDto: RequestCreditDto,
  ) {
    return this.creditService.requestCredit(user.id, requestCreditDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credits for current user' })
  @ApiResponse({ status: 200, description: 'Credits retrieved successfully' })
  async getCredits(@CurrentUser() user: any) {
    return this.creditService.getCredits(user.id);
  }

  @Get(':creditId')
  @ApiOperation({ summary: 'Get specific credit details' })
  @ApiResponse({ status: 200, description: 'Credit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  async getCredit(
    @CurrentUser() user: any,
    @Param('creditId') creditId: string,
  ) {
    return this.creditService.getCredit(user.id, creditId);
  }

  @Post(':creditId/repay')
  @ApiOperation({ summary: 'Make a repayment on credit' })
  @ApiResponse({ status: 201, description: 'Repayment successful' })
  @ApiResponse({ status: 400, description: 'Invalid repayment amount' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  async repayCredit(
    @CurrentUser() user: any,
    @Param('creditId') creditId: string,
    @Body() repayDto: RepayCreditDto,
  ) {
    return this.creditService.repayCredit(user.id, creditId, repayDto);
  }

  @Get(':creditId/schedule')
  @ApiOperation({ summary: 'Get repayment schedule for credit' })
  @ApiResponse({ status: 200, description: 'Repayment schedule retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  async getRepaymentSchedule(
    @CurrentUser() user: any,
    @Param('creditId') creditId: string,
  ) {
    return this.creditService.getRepaymentSchedule(user.id, creditId);
  }
}

