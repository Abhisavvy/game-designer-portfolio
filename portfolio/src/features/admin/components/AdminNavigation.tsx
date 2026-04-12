'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  User,
  FolderOpen,
  Image,
  FileText,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';

const navigationItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/personal', label: 'Personal', icon: User },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/assets', label: 'Assets', icon: Image },
  { href: '/admin/resume', label: 'Resume', icon: FileText },
] as const;

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.slice(0, -1);
  }
  return path;
}

/** Section root match: `/admin` is exact-only; deeper roots match nested routes. */
function isNavItemActive(pathname: string, href: string): boolean {
  const p = normalizePath(pathname);
  const h = normalizePath(href);

  if (h === '/admin') {
    return p === '/admin';
  }

  return p === h || p.startsWith(`${h}/`);
}

export function AdminNavigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="max-lg:w-0 max-lg:flex-shrink-0 max-lg:overflow-visible lg:w-64 lg:flex-shrink-0">
      <div className="fixed left-0 right-0 top-0 z-[45] flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="admin-sidebar-nav"
        >
          <span className="sr-only">Open admin navigation</span>
          <Menu size={22} aria-hidden />
        </button>
        <span className="ml-3 text-sm font-semibold text-gray-900">
          Portfolio Admin
        </span>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        id="admin-sidebar-nav"
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-gray-900 p-4 text-white transition-transform duration-200 ease-out',
          'lg:static lg:z-0 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="mb-6 flex items-center justify-between lg:block">
          <div className="text-lg font-semibold tracking-tight lg:mb-8">
            Portfolio Admin
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin navigation"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        <nav aria-label="Admin sections">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 rounded-lg p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                      isActive
                        ? 'bg-orange-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon size={20} aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
