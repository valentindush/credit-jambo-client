'use client';

import React, { useEffect, useState } from 'react';
import { useAccessToken } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Notification } from '@/lib/types';
import { MdNotifications, MdEmail, MdSms, MdDelete, MdDone } from 'react-icons/md';

export default function NotificationsPage() {
  const token = useAccessToken();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [token, showUnreadOnly]);

  const loadNotifications = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await apiClient.getNotifications(token, {
        unreadOnly: showUnreadOnly,
      });
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (!token) return;
    try {
      await apiClient.markNotificationAsRead(token, notificationId);
      setSuccess('Notification marked as read');
      loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await apiClient.markAllNotificationsAsRead(token);
      setSuccess('All notifications marked as read');
      loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId: string) => {
    if (!token) return;
    try {
      await apiClient.deleteNotification(token, notificationId);
      setSuccess('Notification deleted');
      loadNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'IN_APP':
        return <MdNotifications size={20} />;
      case 'EMAIL':
        return <MdEmail size={20} />;
      case 'SMS':
        return <MdSms size={20} />;
      default:
        return <MdNotifications size={20} />;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {notifications.some((n) => !n.readAt) && (
              <Button
                variant="secondary"
                onClick={handleMarkAllAsRead}
              >
                Mark All as Read
              </Button>
            )}
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

          {/* Filter */}
          <Card>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-gray-700">Show unread only</span>
            </label>
          </Card>

          {/* Notifications List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={notification.readAt ? '' : 'bg-blue-50 border-l-4 border-blue-600'}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {!notification.readAt && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                          )}
                        </div>
                        <p className="text-gray-700 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!notification.readAt && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <MdDone size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete notification"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {showUnreadOnly ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

