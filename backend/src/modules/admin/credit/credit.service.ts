import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, CreditStatus } from '@prisma/client';
import { PrismaService } from '../../../common/prisma.service';
import { ApproveCreditDto } from './dto/approve-credit.dto';
import { RejectCreditDto } from './dto/reject-credit.dto';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  async getPendingCredits(skip = 0, take = 10) {
    const [credits, total] = await Promise.all([
      this.prisma.credit.findMany({
        where: { status: 'PENDING' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.credit.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      data: credits,
      total,
      skip,
      take,
    };
  }

  async getAllCredits(skip = 0, take = 10, status?: string) {
    const where: Prisma.CreditWhereInput = status
      ? { status: status as CreditStatus }
      : {};

    const [credits, total] = await Promise.all([
      this.prisma.credit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.credit.count({ where }),
    ]);

    return {
      data: credits,
      total,
      skip,
      take,
    };
  }

  async getCreditById(creditId: string) {
    const credit = await this.prisma.credit.findUnique({
      where: { id: creditId },
      include: {
        user: true,
        transactions: true,
        repayments: true,
      },
    });

    if (!credit) {
      throw new NotFoundException('Credit not found');
    }

    return credit;
  }

  async approveCredit(creditId: string, adminId: string, approveCreditDto: ApproveCreditDto) {
    const credit = await this.prisma.credit.findUnique({
      where: { id: creditId },
    });

    if (!credit) {
      throw new NotFoundException('Credit not found');
    }

    if (credit.status !== 'PENDING') {
      throw new BadRequestException('Only pending credits can be approved');
    }

    const updatedCredit = await this.prisma.credit.update({
      where: { id: creditId },
      data: {
        status: 'APPROVED',
        approvedBy: adminId,
        approvedAt: new Date(),
      },
      include: {
        user: true,
      },
    });

    return updatedCredit;
  }

  async rejectCredit(creditId: string, rejectCreditDto: RejectCreditDto) {
    const credit = await this.prisma.credit.findUnique({
      where: { id: creditId },
    });

    if (!credit) {
      throw new NotFoundException('Credit not found');
    }

    if (credit.status !== 'PENDING') {
      throw new BadRequestException('Only pending credits can be rejected');
    }

    const updatedCredit = await this.prisma.credit.update({
      where: { id: creditId },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectCreditDto.reason,
      },
      include: {
        user: true,
      },
    });

    return updatedCredit;
  }

  async getCreditStats() {
    const [pending, approved, rejected, disbursed, defaulted] = await Promise.all([
      this.prisma.credit.count({ where: { status: 'PENDING' } }),
      this.prisma.credit.count({ where: { status: 'APPROVED' } }),
      this.prisma.credit.count({ where: { status: 'REJECTED' } }),
      this.prisma.credit.count({ where: { status: 'DISBURSED' } }),
      this.prisma.credit.count({ where: { status: 'DEFAULTED' } }),
    ]);

    return {
      pending,
      approved,
      rejected,
      disbursed,
      defaulted,
    };
  }
}

