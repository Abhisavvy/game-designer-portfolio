'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 
            shadow-sm transition-all focus:border-orange-500 focus:outline-none 
            focus:ring-2 focus:ring-orange-200 hover:border-slate-400
            placeholder:text-slate-400
            ${className}
          `}
          style={{ 
            color: '#0f172a !important',
            WebkitTextFillColor: '#0f172a !important'
          }}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    );
  }
);

AdminInput.displayName = 'AdminInput';

interface AdminTextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  rows?: number;
}

export const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, error, className = '', rows = 4, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`
            w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-3 
            shadow-sm transition-all focus:border-orange-500 focus:outline-none 
            focus:ring-2 focus:ring-orange-200 hover:border-slate-400
            placeholder:text-slate-400 resize-vertical
            ${className}
          `}
          style={{ 
            color: '#0f172a !important',
            WebkitTextFillColor: '#0f172a !important'
          }}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    );
  }
);

AdminTextarea.displayName = 'AdminTextarea';