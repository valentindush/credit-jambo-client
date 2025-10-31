import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class SavingsService {
  constructor(private prisma: PrismaService) {}

  async getSavingsAccounts(userId: string) {
    const accounts = await this.prisma.savings.findMany({
      where: { userId },
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        currency: true,
        interestRate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return accounts;
  }

  async getSavingsAccount(userId: string, accountId: string) {
    const account = await this.prisma.savings.findFirst({
      where: {
        id: accountId,
        userId,
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Savings account not found');
    }

    return account;
  }

  async deposit(userId: string, accountId: string, depositDto: DepositDto) {
    const account = await this.prisma.savings.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Savings account not found');
    }

    if (!account.isActive) {
      throw new BadRequestException('Savings account is not active');
    }

    const balanceBefore = Number(account.balance);
    const balanceAfter = balanceBefore + depositDto.amount;

    // Create transaction and update balance in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          savingsId: accountId,
          type: TransactionType.DEPOSIT,
          amount: depositDto.amount,
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          description: depositDto.description || 'Deposit',
          reference: `DEP-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
      });

      const updatedAccount = await tx.savings.update({
        where: { id: accountId },
        data: { balance: balanceAfter },
      });

      return { transaction, account: updatedAccount };
    });

    return {
      message: 'Deposit successful',
      transaction: result.transaction,
      newBalance: result.account.balance,
    };
  }

  async withdraw(userId: string, accountId: string, withdrawDto: WithdrawDto) {
    const account = await this.prisma.savings.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Savings account not found');
    }

    if (!account.isActive) {
      throw new BadRequestException('Savings account is not active');
    }

    const balanceBefore = Number(account.balance);

    if (balanceBefore < withdrawDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const balanceAfter = balanceBefore - withdrawDto.amount;

    // Create transaction and update balance in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          savingsId: accountId,
          type: TransactionType.WITHDRAWAL,
          amount: withdrawDto.amount,
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          description: withdrawDto.description || 'Withdrawal',
          reference: `WTH-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
      });

      const updatedAccount = await tx.savings.update({
        where: { id: accountId },
        data: { balance: balanceAfter },
      });

      return { transaction, account: updatedAccount };
    });

    return {
      message: 'Withdrawal successful',
      transaction: result.transaction,
      newBalance: result.account.balance,
    };
  }

  async getBalance(userId: string, accountId: string) {
    const account = await this.prisma.savings.findFirst({
      where: {
        id: accountId,
        userId,
      },
      select: {
        id: true,
        accountNumber: true,
        balance: true,
        currency: true,
        updatedAt: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Savings account not found');
    }

    return account;
  }

  async getTransactionHistory(
    userId: string,
    accountId: string,
    limit: number = 50,
  ) {
    const account = await this.prisma.savings.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Savings account not found');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        savingsId: accountId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions;
  }
}

