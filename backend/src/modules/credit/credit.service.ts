import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RequestCreditDto } from './dto/request-credit.dto';
import { RepayCreditDto } from './dto/repay-credit.dto';
import { CreditStatus, TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class CreditService {
  constructor(private prisma: PrismaService) {}

  async requestCredit(userId: string, requestCreditDto: RequestCreditDto) {
    // Check if user has any pending credit requests
    const pendingCredit = await this.prisma.credit.findFirst({
      where: {
        userId,
        status: CreditStatus.PENDING,
      },
    });

    if (pendingCredit) {
      throw new BadRequestException(
        'You already have a pending credit request. Please wait for approval.',
      );
    }

    // Mock credit scoring logic
    const creditScore = await this.calculateCreditScore(userId);

    // Calculate interest rate based on credit score
    const interestRate = this.calculateInterestRate(creditScore);

    // Calculate monthly payment and total repayable
    const monthlyInterestRate = interestRate / 100 / 12;
    const monthlyPayment =
      (requestCreditDto.amount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, requestCreditDto.tenure)) /
      (Math.pow(1 + monthlyInterestRate, requestCreditDto.tenure) - 1);

    const totalRepayable = monthlyPayment * requestCreditDto.tenure;

    // Auto-approve if credit score is high enough
    const autoApprove = creditScore >= 700;

    const credit = await this.prisma.credit.create({
      data: {
        userId,
        amount: requestCreditDto.amount,
        interestRate,
        tenure: requestCreditDto.tenure,
        monthlyPayment,
        totalRepayable,
        outstandingBalance: totalRepayable,
        status: autoApprove ? CreditStatus.APPROVED : CreditStatus.PENDING,
        purpose: requestCreditDto.purpose,
        creditScore,
        approvedAt: autoApprove ? new Date() : null,
        nextPaymentDate: autoApprove
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : null,
      },
    });

    return {
      message: autoApprove
        ? 'Credit request approved automatically'
        : 'Credit request submitted successfully. Awaiting approval.',
      credit,
      autoApproved: autoApprove,
    };
  }

  async getCredits(userId: string) {
    const credits = await this.prisma.credit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        repayments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return credits;
  }

  async getCredit(userId: string, creditId: string) {
    const credit = await this.prisma.credit.findFirst({
      where: {
        id: creditId,
        userId,
      },
      include: {
        repayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!credit) {
      throw new NotFoundException('Credit not found');
    }

    return credit;
  }

  async repayCredit(userId: string, creditId: string, repayDto: RepayCreditDto) {
    const credit = await this.prisma.credit.findFirst({
      where: {
        id: creditId,
        userId,
      },
    });

    if (!credit) {
      throw new NotFoundException('Credit not found');
    }

    if (credit.status !== CreditStatus.ACTIVE && credit.status !== CreditStatus.DISBURSED) {
      throw new BadRequestException('Credit is not active for repayment');
    }

    const outstandingBalance = Number(credit.outstandingBalance);

    if (repayDto.amount > outstandingBalance) {
      throw new BadRequestException(
        `Repayment amount exceeds outstanding balance of ${outstandingBalance}`,
      );
    }

    const newOutstandingBalance = outstandingBalance - repayDto.amount;
    const newAmountPaid = Number(credit.amountPaid) + repayDto.amount;

    // Create transaction and update credit in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          creditId,
          type: TransactionType.CREDIT_REPAYMENT,
          amount: repayDto.amount,
          status: TransactionStatus.COMPLETED,
          description: 'Credit repayment',
          reference: `REP-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        },
      });

      const repayment = await tx.creditRepayment.create({
        data: {
          creditId,
          amount: repayDto.amount,
          transactionId: transaction.id,
        },
      });

      const updatedCredit = await tx.credit.update({
        where: { id: creditId },
        data: {
          amountPaid: newAmountPaid,
          outstandingBalance: newOutstandingBalance,
          status:
            newOutstandingBalance === 0
              ? CreditStatus.COMPLETED
              : credit.status,
          nextPaymentDate:
            newOutstandingBalance > 0
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              : null,
        },
      });

      return { transaction, repayment, credit: updatedCredit };
    });

    return {
      message:
        newOutstandingBalance === 0
          ? 'Credit fully repaid!'
          : 'Repayment successful',
      transaction: result.transaction,
      remainingBalance: result.credit.outstandingBalance,
      nextPaymentDate: result.credit.nextPaymentDate,
    };
  }

  async getRepaymentSchedule(userId: string, creditId: string) {
    const credit = await this.prisma.credit.findFirst({
      where: {
        id: creditId,
        userId,
      },
    });

    if (!credit) {
      throw new NotFoundException('Credit not found');
    }

    // Generate repayment schedule
    const schedule: Array<{
      installmentNumber: number;
      dueDate: Date;
      amount: number;
      status: string;
    }> = [];
    const monthlyPayment = Number(credit.monthlyPayment);
    let remainingBalance = Number(credit.totalRepayable);
    const startDate = credit.disbursedAt || credit.approvedAt || new Date();

    for (let i = 1; i <= credit.tenure; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      const payment = i === credit.tenure ? remainingBalance : monthlyPayment;
      remainingBalance -= payment;

      schedule.push({
        installmentNumber: i,
        dueDate,
        amount: payment,
        status: 'PENDING', // This is simplified; in production, you'd track actual payments
      });
    }

    return {
      credit: {
        id: credit.id,
        amount: credit.amount,
        totalRepayable: credit.totalRepayable,
        monthlyPayment: credit.monthlyPayment,
        tenure: credit.tenure,
        amountPaid: credit.amountPaid,
        outstandingBalance: credit.outstandingBalance,
      },
      schedule,
    };
  }

  // Mock credit scoring logic
  private async calculateCreditScore(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        savings: true,
        credits: true,
        transactions: true,
      },
    });

    if (!user) {
      return 600; // Default base score if user not found
    }

    let score = 600; // Base score

    // Factor 1: Savings balance (max 100 points)
    const totalSavings = user.savings.reduce(
      (sum, account) => sum + Number(account.balance),
      0,
    );
    score += Math.min(100, totalSavings / 100);

    // Factor 2: Credit history (max 100 points)
    const completedCredits = user.credits.filter(
      (c) => c.status === CreditStatus.COMPLETED,
    ).length;
    score += completedCredits * 20;

    // Factor 3: Transaction history (max 50 points)
    const transactionCount = user.transactions.length;
    score += Math.min(50, transactionCount * 2);

    // Factor 4: KYC verification (50 points)
    if (user.kycVerified) {
      score += 50;
    }

    // Cap at 850
    return Math.min(850, Math.round(score));
  }

  private calculateInterestRate(creditScore: number): number {
    if (creditScore >= 800) return 8.0;
    if (creditScore >= 750) return 10.0;
    if (creditScore >= 700) return 12.0;
    if (creditScore >= 650) return 15.0;
    return 18.0;
  }
}

