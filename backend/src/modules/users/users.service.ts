import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        city: true,
        country: true,
        role: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        kycVerified: true,
        profilePicture: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    // Check if phone number is being updated and if it's already taken
    if (updateProfileDto.phoneNumber) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phoneNumber: updateProfileDto.phoneNumber,
          NOT: { id: userId },
        },
      });

      if (existingPhone) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateProfileDto,
        dateOfBirth: updateProfileDto.dateOfBirth
          ? new Date(updateProfileDto.dateOfBirth)
          : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        dateOfBirth: true,
        address: true,
        city: true,
        country: true,
        profilePicture: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens to force re-login
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password changed successfully. Please login again.' };
  }

  async getDashboard(userId: string) {
    const [user, savings, credits, recentTransactions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }),
      this.prisma.savings.findMany({
        where: { userId, isActive: true },
        select: {
          id: true,
          accountNumber: true,
          balance: true,
          currency: true,
          interestRate: true,
        },
      }),
      this.prisma.credit.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          status: true,
          outstandingBalance: true,
          nextPaymentDate: true,
          monthlyPayment: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          description: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalSavings = savings.reduce(
      (sum, account) => sum + Number(account.balance),
      0,
    );

    const activeCreditsArray = credits.filter(
      (c) => c.status === 'ACTIVE' || c.status === 'DISBURSED',
    );

    const totalCreditAmount = credits.reduce(
      (sum, credit) => sum + Number(credit.amount),
      0,
    );

    const outstandingBalance = activeCreditsArray.reduce(
      (sum, credit) => sum + Number(credit.outstandingBalance),
      0,
    );

    return {
      user,
      totalSavings,
      activeCredits: activeCreditsArray.length,
      totalCreditAmount,
      outstandingBalance,
      recentTransactions,
      unreadNotifications: 0,
    };
  }
}

