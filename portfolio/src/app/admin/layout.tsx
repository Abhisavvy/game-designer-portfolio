import { AdminLayout } from '@/features/admin/components/AdminLayout';
import './admin-styles.css';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only allow admin access in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Panel Not Available
          </h1>
          <p className="text-gray-600">
            The admin panel is only available in development mode.
          </p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}
