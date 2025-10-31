'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccessToken } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Credit } from '@/lib/types';

export default function CreditPage() {
  const token = useAccessToken();
  const [credits, setCredits] = useState<Credit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    tenure: '12',
    purpose: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCredits();
  }, [token]);

  const loadCredits = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiClient.getCredits(token);
      setCredits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credits');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCredit = async () => {
    if (!token || !formData.amount || !formData.tenure) return;
    setIsSubmitting(true);
    try {
      await apiClient.requestCredit(token, {
        amount: parseFloat(formData.amount),
        tenure: parseInt(formData.tenure),
        purpose: formData.purpose,
      });
      setSuccess('Credit request submitted successfully!');
      setFormData({ amount: '', tenure: '12', purpose: '' });
      setShowRequestModal(false);
      loadCredits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request credit');
    } finally {
      setIsSubmitting(false);
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
      case 'DEFAULTED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Credit Management</h1>
            <Button
              variant="primary"
              onClick={() => setShowRequestModal(true)}
            >
              + Request Credit
            </Button>
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
                <p className="text-gray-600">Loading credits...</p>
              </div>
            </div>
          ) : credits.length > 0 ? (
            <div className="space-y-4">
              {credits.map((credit) => (
                <Card key={credit.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Credit #{credit.id.substring(0, 8)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(credit.status)}`}>
                          {credit.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-gray-600 text-sm">Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            ${(Number(credit.amount) ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Interest Rate</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {credit.interestRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Tenure</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {credit.tenure} months
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Outstanding</p>
                          <p className="text-lg font-semibold text-red-600">
                            ${(Number(credit.outstandingBalance) ?? 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-600 text-sm">Monthly Payment</p>
                          <p className="font-semibold text-gray-900">
                            ${(Number(credit.monthlyPayment) ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Amount Paid</p>
                          <p className="font-semibold text-green-600">
                            ${(Number(credit.amountPaid) ?? 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 text-sm">Credit Score</p>
                          <p className="font-semibold text-gray-900">
                            {credit.creditScore}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link href={`/credit/${credit.id}`}>
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {(credit.status === 'ACTIVE' || credit.status === 'DISBURSED') && (
                        <Link href={`/credit/${credit.id}/repay`}>
                          <Button variant="primary" size="sm">
                            Repay
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No credits yet</p>
                <Button
                  variant="primary"
                  onClick={() => setShowRequestModal(true)}
                >
                  Request Your First Credit
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Request Credit Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Request Credit"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowRequestModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isSubmitting}
                onClick={handleRequestCredit}
              >
                Submit Request
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Amount"
              type="number"
              placeholder="10000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              min="100"
              max="1000000"
              step="100"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenure (months)
              </label>
              <select
                value={formData.tenure}
                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[6, 12, 24, 36, 48, 60].map((month) => (
                  <option key={month} value={month}>
                    {month} months
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Purpose"
              placeholder="e.g., Business expansion"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

