import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule as AdminAuthModule } from './auth/auth.module';
import { UsersModule as AdminUsersModule } from './users/users.module';
import { CreditModule as AdminCreditModule } from './credit/credit.module';
import { AnalyticsModule as AdminAnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      } as any,
    }),
    AdminAuthModule,
    AdminUsersModule,
    AdminCreditModule,
    AdminAnalyticsModule,
  ],
  exports: [AdminAuthModule, AdminUsersModule, AdminCreditModule, AdminAnalyticsModule],
})
export class AdminModule {}

