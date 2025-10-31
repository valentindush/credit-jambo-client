'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, useAccessToken } from '@/lib/auth-context';
import { apiClient } from '@/lib/api-client';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/Card';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { User } from '@/lib/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const token = useAccessToken();
  const [profile, setProfile] = useState<User | null>(user || null);
  const [isLoading, setIsLoading] = useState(!user);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!token || !profile) return;
    setIsSaving(true);
    try {
      await apiClient.updateProfile(token, formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      await apiClient.changePassword(token, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>

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
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          ) : profile ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <div className="lg:col-span-2">
                <Card title="Personal Information">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">First Name</p>
                        {isEditing ? (
                          <Input
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-900">
                            {profile.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Last Name</p>
                        {isEditing ? (
                          <Input
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                          />
                        ) : (
                          <p className="text-lg font-semibold text-gray-900">
                            {profile.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.email}</p>
                    </div>

                    <div>
                      <p className="text-gray-600 text-sm">Phone Number</p>
                      {isEditing ? (
                        <Input
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, phoneNumber: e.target.value })
                          }
                        />
                      ) : (
                        <p className="text-lg font-semibold text-gray-900">
                          {profile.phoneNumber || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      {isEditing ? (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            isLoading={isSaving}
                            onClick={handleSaveProfile}
                          >
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => setIsEditing(true)}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Account Status */}
              <div>
                <Card title="Account Status">
                  <div className="space-y-4">
                    <div>
                      <p className="text-gray-600 text-sm">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        profile.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-yellow-50 text-yellow-700'
                      }`}>
                        {profile.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Role</p>
                      <p className="text-lg font-semibold text-gray-900">{profile.role}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">KYC Verified</p>
                      <p className="text-lg font-semibold">
                        {profile.kycVerified ? '✓ Yes' : '✗ No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Member Since</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {/* Change Password */}
          <Card title="Security">
            {!showPasswordForm ? (
              <Button
                variant="secondary"
                onClick={() => setShowPasswordForm(true)}
              >
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, oldPassword: e.target.value })
                  }
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  helperText="At least 8 characters"
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                />
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPasswordForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    isLoading={isChangingPassword}
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

