'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAccessToken } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Credit } from '@/lib/types';

export default function RepaymentPage() {
  const params = useParams();
  const router = useRouter();
  const creditId = params.id as string;
  const token = useAccessToken();
  const [credit, setCredit] = useState<Credit | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCredit();
  }, [token, creditId]);

  const loadCredit = async () => {
    if (!token || !creditId) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiClient.getCredit(token, creditId);
      setCredit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !creditId || !amount) return;

    const repayAmount = parseFloat(amount);
    if (!credit || repayAmount > Number(credit.outstandingBalance)) {
      setError(`Amount cannot exceed outstanding balance of $${(Number(credit?.outstandingBalance) ?? 0).toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.repayCredit(token, creditId, { amount: repayAmount });
      setSuccess('Repayment successful!');
      setAmount('');
      setTimeout(() => {
        router.push(`/credit/${creditId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Repayment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Make a Repayment</h1>
            <Link href={`/credit/${creditId}`}>
              <Button variant="secondary">← Back</Button>
            </Link>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess('')}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credit Summary */}
              <div className="lg:col-span-1">
                <Card title="Credit Summary">
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Principal Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(Number(credit.amount) ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Outstanding Balance</p>
                      <p className="text-2xl font-bold text-red-600">
                        ${(Number(credit.outstandingBalance) ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Monthly Payment</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${(Number(credit.monthlyPayment) ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Amount Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${(Number(credit.amountPaid) ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Repayment Form */}
              <div className="lg:col-span-2">
                <Card title="Enter Repayment Amount">
                  <form onSubmit={handleRepay} className="space-y-6">
                    <Input
                      label="Repayment Amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max={Number(credit.outstandingBalance)}
                      step="0.01"
                      required
                      helperText={`Maximum: $${(Number(credit.outstandingBalance) ?? 0).toFixed(2)}`}
                    />

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Suggested Payment:</strong> ${(Number(credit.monthlyPayment) ?? 0).toFixed(2)} (monthly installment)
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setAmount(credit.monthlyPayment.toString())}
                      >
                        Use Monthly Payment
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setAmount(credit.outstandingBalance.toString())}
                      >
                        Pay Full Amount
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      isLoading={isSubmitting}
                      className="w-full"
                    >
                      Confirm Repayment
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

