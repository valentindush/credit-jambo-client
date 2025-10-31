import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CreditController } from './credit.controller';
import { CreditService } from './credit.service';
import { PrismaService } from '../../../common/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      } as any,
    }),
  ],
  controllers: [CreditController],
  providers: [CreditService, PrismaService],
  exports: [CreditService],
})
export class CreditModule {}

