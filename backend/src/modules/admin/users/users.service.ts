import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(skip = 0, take = 10, search?: string) {
    const where: Prisma.UserWhereInput = search
      ? {
          AND: [
            { role: 'CUSTOMER' },
            {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } },
              ],
            },
          ],
        }
      : { role: 'CUSTOMER' };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          status: true,
          emailVerified: true,
          kycVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      data: users,
      total,
      skip,
      take,
    };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        savings: true,
        credits: true,
        devices: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUserStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: updateUserStatusDto.status,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async getUserStats() {
    const [totalUsers, activeUsers, suspendedUsers, pendingVerification] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', status: 'SUSPENDED' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', status: 'PENDING_VERIFICATION' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      pendingVerification,
    };
  }
}

