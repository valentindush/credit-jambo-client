import { Module } from '@nestjs/common';
import { SavingsController } from './savings.controller';
import { SavingsService } from './savings.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [SavingsController],
  providers: [SavingsService, PrismaService],
  exports: [SavingsService],
})
export class SavingsModule {}

