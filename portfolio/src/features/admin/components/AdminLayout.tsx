import { ReactNode } from 'react';
import { AdminNavigation } from './AdminNavigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-panel flex min-h-screen bg-slate-50">
      <AdminNavigation />
      <main className="flex-1 p-4 pt-20 lg:pt-8 lg:p-8">
        <div className="mx-auto max-w-7xl min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
