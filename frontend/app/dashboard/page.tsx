'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useAccessToken } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { DashboardData } from '@/lib/types';
import { MdSavings, MdCreditCard, MdTrendingUp } from 'react-icons/md';

export default function DashboardPage() {
  const { user } = useAuth();
  const token = useAccessToken();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiClient.getDashboard(token);
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-2">Here's your financial overview</p>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading dashboard...</p>
              </div>
            </div>
          ) : dashboard ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Total Savings</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      ${(dashboard?.totalSavings ?? 0).toFixed(2)}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Active Credits</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {dashboard?.activeCredits ?? 0}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Total Credit Amount</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      ${(dashboard?.totalCreditAmount ?? 0).toFixed(2)}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">Outstanding Balance</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      ${(dashboard?.outstandingBalance ?? 0).toFixed(2)}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card title="Quick Actions">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/savings">
                    <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                      <MdSavings size={20} />
                      Manage Savings
                    </Button>
                  </Link>
                  <Link href="/credit">
                    <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                      <MdCreditCard size={20} />
                      Request Credit
                    </Button>
                  </Link>
                  <Link href="/transactions">
                    <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                      <MdTrendingUp size={20} />
                      View Transactions
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Recent Transactions */}
              <Card title="Recent Transactions">
                {dashboard?.recentTransactions && dashboard.recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.recentTransactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {txn.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className={`font-semibold ${
                          txn.type === 'DEPOSIT' || txn.type === 'CREDIT_DISBURSEMENT'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {txn.type === 'DEPOSIT' || txn.type === 'CREDIT_DISBURSEMENT' ? '+' : '-'}
                          ${(Number(txn.amount) ?? 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No transactions yet</p>
                )}
              </Card>
            </>
          ) : null}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

