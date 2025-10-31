import {
  User,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  SavingsAccount,
  DepositRequest,
  WithdrawRequest,
  Transaction,
  TransactionStats,
  Credit,
  RequestCreditRequest,
  RepayCreditRequest,
  RepaymentScheduleResponse,
  Notification,
  DashboardData,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API Error: ${response.status}`);
    }
    return response.json();
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async validateToken(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Users endpoints
  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async updateProfile(token: string, data: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async changePassword(token: string, data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getDashboard(token: string): Promise<DashboardData> {
    const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Savings endpoints
  async getSavingsAccounts(token: string): Promise<SavingsAccount[]> {
    const response = await fetch(`${API_BASE_URL}/savings`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getSavingsAccount(token: string, accountId: string): Promise<SavingsAccount> {
    const response = await fetch(`${API_BASE_URL}/savings/${accountId}`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async deposit(token: string, accountId: string, data: DepositRequest): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/savings/${accountId}/deposit`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async withdraw(token: string, accountId: string, data: WithdrawRequest): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/savings/${accountId}/withdraw`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getSavingsBalance(token: string, accountId: string): Promise<{ balance: number }> {
    const response = await fetch(`${API_BASE_URL}/savings/${accountId}/balance`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getSavingsTransactions(token: string, accountId: string): Promise<Transaction[]> {
    const response = await fetch(`${API_BASE_URL}/savings/${accountId}/transactions`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Credit endpoints
  async requestCredit(token: string, data: RequestCreditRequest): Promise<Credit> {
    const response = await fetch(`${API_BASE_URL}/credit/request`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getCredits(token: string): Promise<Credit[]> {
    const response = await fetch(`${API_BASE_URL}/credit`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getCredit(token: string, creditId: string): Promise<Credit> {
    const response = await fetch(`${API_BASE_URL}/credit/${creditId}`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async repayCredit(token: string, creditId: string, data: RepayCreditRequest): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/credit/${creditId}/repay`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async getRepaymentSchedule(token: string, creditId: string): Promise<RepaymentScheduleResponse> {
    const response = await fetch(`${API_BASE_URL}/credit/${creditId}/schedule`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Transactions endpoints
  async getTransactions(token: string, filters?: Record<string, any>): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getTransactionStats(token: string, period: string = 'month'): Promise<TransactionStats> {
    const response = await fetch(`${API_BASE_URL}/transactions/stats?period=${period}`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getMonthlyAnalytics(token: string, months: number = 6): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/transactions/analytics?months=${months}`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  // Notifications endpoints
  async getNotifications(token: string, filters?: Record<string, any>): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async getUnreadCount(token: string): Promise<{ unreadCount: number }> {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async markNotificationAsRead(token: string, notificationId: string): Promise<Notification> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'POST',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }

  async deleteNotification(token: string, notificationId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    });
    return this.handleResponse(response);
  }
}

export const apiClient = new ApiClient();

