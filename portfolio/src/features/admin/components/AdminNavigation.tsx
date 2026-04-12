'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, FolderOpen, Image, FileText } from 'lucide-react';

const navigationItems = [
  { href: '/admin', label: 'Dashboard', icon: FolderOpen },
  { href: '/admin/personal', label: 'Personal', icon: User },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/assets', label: 'Assets', icon: Image },
  { href: '/admin/resume', label: 'Resume', icon: FileText },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Portfolio Admin</h1>
      </div>

      <ul className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
