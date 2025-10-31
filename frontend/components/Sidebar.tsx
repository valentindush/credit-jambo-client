'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  MdDashboard,
  MdSavings,
  MdCreditCard,
  MdTrendingUp,
  MdNotifications,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
} from 'react-icons/md';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: MdDashboard },
    { href: '/savings', label: 'Savings', icon: MdSavings },
    { href: '/credit', label: 'Credit', icon: MdCreditCard },
    { href: '/transactions', label: 'Transactions', icon: MdTrendingUp },
    { href: '/notifications', label: 'Notifications', icon: MdNotifications },
    { href: '/profile', label: 'Profile', icon: MdPerson },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle menu"
      >
        <MdMenu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white p-6 transform transition-transform duration-300 z-30 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">CreditJambo</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-2xl hover:text-gray-300 transition-colors"
            aria-label="Close menu"
          >
            <MdClose size={24} />
          </button>
        </div>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          aria-label="Logout"
        >
          <MdLogout size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Logout"
        footer={
          <div className="flex gap-3 w-full">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmLogout}
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to logout? You will need to login again to access your account.
        </p>
      </Modal>
    </>
  );
}

