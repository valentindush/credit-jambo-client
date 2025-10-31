'use client';

import React, { useEffect, useState } from 'react';
import { useAccessToken } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Transaction, TransactionType } from '@/lib/types';
import { MdArrowDownward, MdArrowUpward, MdCreditCard, MdPayments } from 'react-icons/md';

export default function TransactionsPage() {
  const token = useAccessToken();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TransactionType | ''>('');

  useEffect(() => {
    loadTransactions();
  }, [token, filter]);

  const loadTransactions = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiClient.getTransactions(token, filter ? { type: filter } : {});
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'DEPOSIT':
        return <MdArrowDownward size={20} />;
      case 'WITHDRAWAL':
        return <MdArrowUpward size={20} />;
      case 'CREDIT_DISBURSEMENT':
        return <MdCreditCard size={20} />;
      case 'CREDIT_REPAYMENT':
        return <MdPayments size={20} />;
      default:
        return <MdArrowDownward size={20} />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'DEPOSIT':
      case 'CREDIT_DISBURSEMENT':
        return 'text-green-600';
      case 'WITHDRAWAL':
      case 'CREDIT_REPAYMENT':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
            />
          )}

          {/* Filter */}
          <Card>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === ''
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {(['DEPOSIT', 'WITHDRAWAL', 'CREDIT_DISBURSEMENT', 'CREDIT_REPAYMENT'] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </Card>

          {/* Transactions List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <Card key={txn.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        txn.type === 'DEPOSIT' || txn.type === 'CREDIT_DISBURSEMENT'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {getTransactionIcon(txn.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{txn.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(txn.createdAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Ref: {txn.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getTransactionColor(txn.type)}`}>
                        {txn.type === 'DEPOSIT' || txn.type === 'CREDIT_DISBURSEMENT' ? '+' : '-'}
                        ${(Number(txn.amount) ?? 0).toFixed(2)}
                      </p>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        txn.status === 'COMPLETED'
                          ? 'bg-green-50 text-green-700'
                          : txn.status === 'PENDING'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600">No transactions found</p>
              </div>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

