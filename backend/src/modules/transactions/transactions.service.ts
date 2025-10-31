import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async getTransactions(
    userId: string,
    filters?: {
      type?: TransactionType;
      status?: TransactionStatus;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ) {
    const where: any = { userId };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
      include: {
        savings: {
          select: {
            accountNumber: true,
          },
        },
        credit: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
    });

    return transactions;
  }

  async getTransaction(userId: string, transactionId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        savings: true,
        credit: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async getTransactionStats(userId: string, period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
        status: TransactionStatus.COMPLETED,
      },
    });

    const stats = {
      totalTransactions: transactions.length,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalCreditDisbursements: 0,
      totalCreditRepayments: 0,
      depositCount: 0,
      withdrawalCount: 0,
      creditDisbursementCount: 0,
      creditRepaymentCount: 0,
    };

    transactions.forEach((txn) => {
      const amount = Number(txn.amount);
      switch (txn.type) {
        case TransactionType.DEPOSIT:
          stats.totalDeposits += amount;
          stats.depositCount++;
          break;
        case TransactionType.WITHDRAWAL:
          stats.totalWithdrawals += amount;
          stats.withdrawalCount++;
          break;
        case TransactionType.CREDIT_DISBURSEMENT:
          stats.totalCreditDisbursements += amount;
          stats.creditDisbursementCount++;
          break;
        case TransactionType.CREDIT_REPAYMENT:
          stats.totalCreditRepayments += amount;
          stats.creditRepaymentCount++;
          break;
      }
    });

    return {
      period,
      startDate,
      endDate: now,
      stats,
    };
  }

  async getMonthlyAnalytics(userId: string, months: number = 6) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - months);

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
        status: TransactionStatus.COMPLETED,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by month
    const monthlyData: { [key: string]: any } = {};

    transactions.forEach((txn) => {
      const monthKey = `${txn.createdAt.getFullYear()}-${String(txn.createdAt.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          deposits: 0,
          withdrawals: 0,
          creditDisbursements: 0,
          creditRepayments: 0,
          transactionCount: 0,
        };
      }

      const amount = Number(txn.amount);
      monthlyData[monthKey].transactionCount++;

      switch (txn.type) {
        case TransactionType.DEPOSIT:
          monthlyData[monthKey].deposits += amount;
          break;
        case TransactionType.WITHDRAWAL:
          monthlyData[monthKey].withdrawals += amount;
          break;
        case TransactionType.CREDIT_DISBURSEMENT:
          monthlyData[monthKey].creditDisbursements += amount;
          break;
        case TransactionType.CREDIT_REPAYMENT:
          monthlyData[monthKey].creditRepayments += amount;
          break;
      }
    });

    return Object.values(monthlyData);
  }
}

