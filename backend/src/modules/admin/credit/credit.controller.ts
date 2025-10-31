import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreditService } from './credit.service';
import { ApproveCreditDto } from './dto/approve-credit.dto';
import { RejectCreditDto } from './dto/reject-credit.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';

@ApiTags('Admin Credit Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles('ADMIN')
@Controller('admin/credit')
export class CreditController {
  constructor(private readonly creditService: CreditService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get pending credit requests' })
  @ApiResponse({ status: 200, description: 'Pending credits retrieved successfully' })
  async getPendingCredits(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return this.creditService.getPendingCredits(skip || 0, take || 10);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get credit statistics' })
  @ApiResponse({ status: 200, description: 'Credit stats retrieved successfully' })
  async getCreditStats() {
    return this.creditService.getCreditStats();
  }

  @Get()
  @ApiOperation({ summary: 'Get all credits' })
  @ApiResponse({ status: 200, description: 'Credits retrieved successfully' })
  async getAllCredits(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('status') status?: string,
  ) {
    return this.creditService.getAllCredits(skip || 0, take || 10, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get credit by ID' })
  @ApiResponse({ status: 200, description: 'Credit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  async getCreditById(@Param('id') creditId: string) {
    return this.creditService.getCreditById(creditId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve credit request' })
  @ApiResponse({ status: 200, description: 'Credit approved successfully' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  @ApiResponse({ status: 400, description: 'Credit cannot be approved' })
  async approveCredit(
    @Param('id') creditId: string,
    @CurrentUser() user: any,
    @Body() approveCreditDto: ApproveCreditDto,
  ) {
    return this.creditService.approveCredit(creditId, user.id, approveCreditDto);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject credit request' })
  @ApiResponse({ status: 200, description: 'Credit rejected successfully' })
  @ApiResponse({ status: 404, description: 'Credit not found' })
  @ApiResponse({ status: 400, description: 'Credit cannot be rejected' })
  async rejectCredit(
    @Param('id') creditId: string,
    @Body() rejectCreditDto: RejectCreditDto,
  ) {
    return this.creditService.rejectCredit(creditId, rejectCreditDto);
  }
}

