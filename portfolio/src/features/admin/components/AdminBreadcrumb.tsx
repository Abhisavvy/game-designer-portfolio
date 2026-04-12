'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function AdminBreadcrumb() {
  const pathname = usePathname();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/admin' }
    ];
    
    if (segments.length > 1) {
      const section = segments[1];
      switch (section) {
        case 'personal':
          breadcrumbs.push({ label: 'Personal Info', href: '/admin/personal' });
          break;
        case 'projects':
          breadcrumbs.push({ label: 'Projects', href: '/admin/projects' });
          if (segments[2] === 'new') {
            breadcrumbs.push({ label: 'New Project', href: '/admin/projects/new' });
          } else if (segments[2] && segments[2] !== 'cv-sync') {
            breadcrumbs.push({ label: 'Edit Project', href: `/admin/projects/${segments[2]}` });
          } else if (segments[2] === 'cv-sync') {
            breadcrumbs.push({ label: 'CV Sync', href: '/admin/projects/cv-sync' });
          }
          break;
        case 'assets':
          breadcrumbs.push({ label: 'Assets', href: '/admin/assets' });
          break;
        case 'resume':
          breadcrumbs.push({ label: 'Resume', href: '/admin/resume' });
          break;
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const canGoBack = breadcrumbs.length > 1;
  const previousPage = canGoBack ? breadcrumbs[breadcrumbs.length - 2] : null;

  return (
    <div className="flex items-center justify-between mb-6">
      <nav className="flex items-center space-x-2 text-sm">
        <Home className="w-4 h-4 text-slate-400" />
        {breadcrumbs.map((item, index) => (
          <div key={item.href} className="flex items-center">
            {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-slate-900">{item.label}</span>
            ) : (
              <Link 
                href={item.href}
                className="text-slate-600 hover:text-orange-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
      
      {canGoBack && previousPage && (
        <Link
          href={previousPage.href}
          className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-orange-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {previousPage.label}</span>
        </Link>
      )}
    </div>
  );
}