'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAccessToken } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Credit, RepaymentScheduleResponse } from '@/lib/types';

export default function CreditDetailsPage() {
  const params = useParams();
  const creditId = params.id as string;
  const token = useAccessToken();
  const [credit, setCredit] = useState<Credit | null>(null);
  const [schedule, setSchedule] = useState<RepaymentScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCreditDetails();
  }, [token, creditId]);

  const loadCreditDetails = async () => {
    if (!token || !creditId) {
      setIsLoading(false);
      return;
    }
    try {
      const [creditData, scheduleData] = await Promise.all([
        apiClient.getCredit(token, creditId),
        apiClient.getRepaymentSchedule(token, creditId),
      ]);
      setCredit(creditData);
      setSchedule(scheduleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credit details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'text-green-600 bg-green-50';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'COMPLETED':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Credit Details</h1>
            <Link href="/credit">
              <Button variant="secondary">← Back to Credits</Button>
            </Link>
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
                <p className="text-gray-600">Loading credit details...</p>
              </div>
            </div>
          ) : credit ? (
            <>
              {/* Credit Overview */}
              <Card>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Credit #{credit.id.substring(0, 8)}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Created on {new Date(credit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(credit.status)}`}>
                    {credit.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-gray-600 text-sm">Principal Amount</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      ${(Number(credit.amount) ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Interest Rate</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {credit.interestRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Tenure</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {credit.tenure} months
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Credit Score</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {credit.creditScore}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Repayment Progress */}
              <Card title="Repayment Progress">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600">Total Repayable</p>
                      <p className="font-semibold text-gray-900">
                        ${(Number(credit.totalRepayable) ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((Number(credit.amountPaid) ?? 0) / (Number(credit.totalRepayable) ?? 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Amount Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${(Number(credit.amountPaid) ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Outstanding</p>
                      <p className="text-lg font-semibold text-red-600">
                        ${(Number(credit.outstandingBalance) ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Payment</p>
                      <p className="text-lg font-semibold text-blue-600">
                        ${(Number(credit.monthlyPayment) ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Repayment Schedule */}
              {schedule && (
                <Card title="Repayment Schedule">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Installment
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Due Date
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-gray-900">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.schedule.map((item) => (
                          <tr key={item.installmentNumber} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900">
                              #{item.installmentNumber}
                            </td>
                            <td className="py-3 px-4 text-gray-900">
                              {new Date(item.dueDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">
                              ${(Number(item.amount) ?? 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-50 text-yellow-600">
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Action Buttons */}
              {(credit.status === 'ACTIVE' || credit.status === 'DISBURSED') && (
                <Card>
                  <Link href={`/credit/${credit.id}/repay`}>
                    <Button variant="primary" size="lg" className="w-full">
                      Make a Repayment
                    </Button>
                  </Link>
                </Card>
              )}
            </>
          ) : null}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

