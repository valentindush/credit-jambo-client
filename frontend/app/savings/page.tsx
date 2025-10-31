'use client';

import React, { useEffect, useState } from 'react';
import { useAccessToken } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { SavingsAccount, Transaction } from '@/lib/types';
import { MdArrowDownward, MdArrowUpward } from 'react-icons/md';

export default function SavingsPage() {
  const token = useAccessToken();
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [token]);

  const loadAccounts = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiClient.getSavingsAccounts(token);
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0]);
        loadTransactions(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTransactions = async (accountId: string) => {
    if (!token) return;
    try {
      const data = await apiClient.getSavingsTransactions(token, accountId);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const handleDeposit = async () => {
    if (!selectedAccount || !token || !amount) return;
    setIsSubmitting(true);
    try {
      await apiClient.deposit(token, selectedAccount.id, { amount: parseFloat(amount) });
      setSuccess('Deposit successful!');
      setAmount('');
      setShowDepositModal(false);
      loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedAccount || !token || !amount) return;
    setIsSubmitting(true);
    try {
      await apiClient.withdraw(token, selectedAccount.id, { amount: parseFloat(amount) });
      setSuccess('Withdrawal successful!');
      setAmount('');
      setShowWithdrawModal(false);
      loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Savings Accounts</h1>

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
                <p className="text-gray-600">Loading accounts...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Accounts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <Card
                    key={account.id}
                    className={`cursor-pointer transition-all ${
                      selectedAccount?.id === account.id
                        ? 'ring-2 ring-blue-600'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedAccount(account);
                      loadTransactions(account.id);
                    }}
                  >
                    <div className="space-y-4">
                      <div>
                        <p className="text-gray-600 text-sm">Account Number</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {account.accountNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Balance</p>
                        <p className="text-3xl font-bold text-green-600">
                          ${(Number(account.balance) ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Actions */}
              {selectedAccount && (
                <Card title="Account Actions">
                  <div className="flex gap-4">
                    <Button
                      variant="success"
                      onClick={() => setShowDepositModal(true)}
                      className="flex items-center justify-center gap-2"
                    >
                      <MdArrowDownward size={20} />
                      Deposit
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setShowWithdrawModal(true)}
                      className="flex items-center justify-center gap-2"
                    >
                      <MdArrowUpward size={20} />
                      Withdraw
                    </Button>
                  </div>
                </Card>
              )}

              {/* Transactions */}
              <Card title="Recent Transactions">
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((txn) => (
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
                          txn.type === 'DEPOSIT'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {txn.type === 'DEPOSIT' ? '+' : '-'}
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
          )}
        </div>

        {/* Deposit Modal */}
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title="Deposit Funds"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowDepositModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                isLoading={isSubmitting}
                onClick={handleDeposit}
              >
                Deposit
              </Button>
            </>
          }
        >
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
          />
        </Modal>

        {/* Withdraw Modal */}
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          title="Withdraw Funds"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setShowWithdrawModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isSubmitting}
                onClick={handleWithdraw}
              >
                Withdraw
              </Button>
            </>
          }
        >
          <Input
            label="Amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
            required
          />
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

