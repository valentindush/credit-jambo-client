'use client';

import React from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      {/* Main content area with proper margin to accommodate fixed sidebar */}
      <main className="flex-1 overflow-auto md:ml-64 ml-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

