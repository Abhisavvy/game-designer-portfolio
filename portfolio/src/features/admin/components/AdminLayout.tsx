'use client';

import { ReactNode } from 'react';
import { AdminNavigation } from './AdminNavigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNavigation />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
