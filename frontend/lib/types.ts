// Auth Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'CUSTOMER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  kycVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Savings Types
export interface SavingsAccount {
  id: string;
  userId: string;
  accountNumber: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepositRequest {
  amount: number;
}

export interface WithdrawRequest {
  amount: number;
}

// Transaction Types
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'CREDIT_DISBURSEMENT' | 'CREDIT_REPAYMENT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Transaction {
  id: string;
  userId: string;
  savingsId?: string;
  creditId?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStats {
  period: string;
  startDate: string;
  endDate: string;
  stats: {
    totalTransactions: number;
    totalDeposits: number;
    totalWithdrawals: number;
    totalCreditDisbursements: number;
    totalCreditRepayments: number;
    depositCount: number;
    withdrawalCount: number;
    creditDisbursementCount: number;
    creditRepaymentCount: number;
  };
}

// Credit Types
export type CreditStatus = 'PENDING' | 'APPROVED' | 'DISBURSED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';

export interface Credit {
  id: string;
  userId: string;
  amount: number;
  interestRate: number;
  tenure: number;
  monthlyPayment: number;
  totalRepayable: number;
  amountPaid: number;
  outstandingBalance: number;
  status: CreditStatus;
  purpose?: string;
  creditScore: number;
  approvedAt?: string;
  disbursedAt?: string;
  createdAt: string;
  updatedAt: string;
  repayments?: CreditRepayment[];
}

export interface CreditRepayment {
  id: string;
  creditId: string;
  amount: number;
  transactionId: string;
  createdAt: string;
}

export interface RequestCreditRequest {
  amount: number;
  tenure: number;
  purpose?: string;
}

export interface RepayCreditRequest {
  amount: number;
}

export interface RepaymentSchedule {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: string;
}

export interface RepaymentScheduleResponse {
  credit: {
    id: string;
    amount: number;
    totalRepayable: number;
    monthlyPayment: number;
    tenure: number;
    amountPaid: number;
    outstandingBalance: number;
  };
  schedule: RepaymentSchedule[];
}

// Notification Types
export type NotificationType = 'IN_APP' | 'EMAIL' | 'SMS';
export type NotificationStatus = 'PENDING' | 'SENT' | 'READ' | 'FAILED';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  readAt?: string;
  sentAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardData {
  user: User;
  totalSavings: number;
  activeCredits: number;
  totalCreditAmount: number;
  outstandingBalance: number;
  recentTransactions: Transaction[];
  unreadNotifications: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

