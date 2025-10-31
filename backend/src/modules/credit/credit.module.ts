import { Module } from '@nestjs/common';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [CreditController],
  providers: [CreditService, PrismaService],
  exports: [CreditService],
})
export class CreditModule {}

