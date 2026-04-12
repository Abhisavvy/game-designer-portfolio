'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface AdminBackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function AdminBackButton({ 
  href, 
  label = 'Back', 
  className = '' 
}: AdminBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-orange-200 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}