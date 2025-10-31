import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalSavings,
      totalCredits,
      pendingCredits,
      totalTransactions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
      this.prisma.savings.aggregate({
        _sum: { balance: true },
      }),
      this.prisma.credit.count(),
      this.prisma.credit.count({ where: { status: 'PENDING' } }),
      this.prisma.transaction.count(),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalSavings: totalSavings._sum.balance || 0,
      totalCredits,
      pendingCredits,
      totalTransactions,
    };
  }

  async getTransactionStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get daily transaction data for time-series chart
    const dailyTransactions = await this.prisma.transaction.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
      _sum: {
        amount: true,
      },
    });

    // Get summary stats
    const transactions = await this.prisma.transaction.groupBy({
      by: ['type', 'status'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
      _sum: {
        amount: true,
      },
    });

    // Calculate totals
    const totalTransactions = await this.prisma.transaction.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    const totalAmount = await this.prisma.transaction.aggregate({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalAmountValue = typeof totalAmount._sum.amount === 'number'
      ? totalAmount._sum.amount
      : parseFloat(String(totalAmount._sum.amount || 0));

    const averageAmount = totalTransactions > 0
      ? totalAmountValue / totalTransactions
      : 0;

    return {
      totalTransactions,
      totalAmount: totalAmountValue,
      averageAmount,
      byType: transactions,
      daily: dailyTransactions.map(d => {
        const amount = typeof d._sum.amount === 'number'
          ? d._sum.amount
          : parseFloat(String(d._sum.amount || 0));
        return {
          date: d.createdAt,
          count: d._count,
          amount,
        };
      }),
    };
  }

  async getUserGrowth(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    return users;
  }

  async getCreditPerformance() {
    const [
      totalRequested,
      totalApproved,
      totalRejected,
      totalDisbursed,
      totalDefaulted,
    ] = await Promise.all([
      this.prisma.credit.count(),
      this.prisma.credit.count({ where: { status: 'APPROVED' } }),
      this.prisma.credit.count({ where: { status: 'REJECTED' } }),
      this.prisma.credit.count({ where: { status: 'DISBURSED' } }),
      this.prisma.credit.count({ where: { status: 'DEFAULTED' } }),
    ]);

    const approvalRate = totalRequested > 0 ? (totalApproved / totalRequested) * 100 : 0;
    const rejectionRate = totalRequested > 0 ? (totalRejected / totalRequested) * 100 : 0;
    const defaultRate = totalDisbursed > 0 ? (totalDefaulted / totalDisbursed) * 100 : 0;

    return {
      totalRequested,
      totalApproved,
      totalRejected,
      totalDisbursed,
      totalDefaulted,
      approvalRate: approvalRate.toFixed(2),
      rejectionRate: rejectionRate.toFixed(2),
      defaultRate: defaultRate.toFixed(2),
    };
  }

  async getSavingsStats() {
    const [totalAccounts, totalBalance, averageBalance] = await Promise.all([
      this.prisma.savings.count(),
      this.prisma.savings.aggregate({
        _sum: { balance: true },
      }),
      this.prisma.savings.aggregate({
        _avg: { balance: true },
      }),
    ]);

    return {
      totalAccounts,
      totalBalance: totalBalance._sum.balance || 0,
      averageBalance: averageBalance._avg.balance || 0,
    };
  }
}

