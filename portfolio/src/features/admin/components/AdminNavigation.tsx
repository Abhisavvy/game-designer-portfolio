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
  Link2,
} from 'lucide-react';

const navigationItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/personal', label: 'Personal', icon: User },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen },
  { href: '/admin/projects/cv-sync', label: 'CV sync', icon: Link2 },
  { href: '/admin/assets', label: 'Assets', icon: Image },
  { href: '/admin/resume', label: 'Resume', icon: FileText },
] as const;

/** Routes under `/admin/projects/*` that use their own nav entry (avoid double-active with Projects). */
const ADMIN_PROJECT_NESTED_NAV_HREFS = ['/admin/projects/cv-sync'] as const;

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

  if (h === '/admin/projects') {
    if (p === h) return true;
    if (!p.startsWith(`${h}/`)) return false;
    return !ADMIN_PROJECT_NESTED_NAV_HREFS.some(
      (nested) => p === nested || p.startsWith(`${nested}/`),
    );
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
    <div className="max-lg:w-0 max-lg:flex-shrink-0 max-lg:overflow-visible lg:w-72 lg:flex-shrink-0">
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
          'fixed inset-y-0 left-0 z-50 w-72 shrink-0 bg-slate-900 border-r border-slate-800 text-white transition-transform duration-200 ease-out',
          'lg:static lg:z-0 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between lg:block">
          <div className="flex items-center space-x-3 lg:mb-0">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white tracking-tight">
                Portfolio Admin
              </div>
              <p className="text-xs text-slate-400 hidden lg:block">Content Management</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin navigation"
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Admin sections" className="p-4 flex-1">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/25'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} aria-hidden />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isActive && (
                      <div className="w-1 h-1 bg-white/70 rounded-full"></div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 text-center">
            Development Mode Only
          </div>
        </div>
      </aside>
    </div>
  );
}
